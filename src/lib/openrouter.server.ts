// OpenRouter chat helper. Server-only. Works on any host (Vercel, etc.).
// Model default: openai/gpt-oss-120b:free via https://openrouter.ai/api/v1
//
// OpenRouter free tier limits (as of 2026):
//   - 20 requests / minute
//   - 50 requests / day  (if lifetime credits purchased < $10)
//   - 1000 requests / day (if $10+ credits ever added — one-time top-up unlocks this permanently)
// Burst / concurrent requests can also trigger 429. This helper retries 429/5xx
// with exponential backoff and honors the Retry-After header.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

type Msg = { role: "system" | "user" | "assistant"; content: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function callOpenRouter(opts: {
  system: string;
  user: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  /** Max retries on 429/5xx. Default 4 (~ up to ~60s total wait). */
  maxRetries?: number;
}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");

  const messages: Msg[] = [
    { role: "system", content: opts.system },
    { role: "user", content: opts.user },
  ];

  const body: Record<string, unknown> = {
    model: opts.model ?? OPENROUTER_MODEL,
    messages,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  // Default 1 retry — Vercel serverless has a 60s hard timeout; long
  // exponential backoff would exceed it and the request appears "stuck".
  const maxRetries = opts.maxRetries ?? 1;
  let attempt = 0;
  let lastErrText = "";

  while (true) {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://allsportslive.lovable.app",
        "X-Title": "PlaySports",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const raw = json.choices?.[0]?.message?.content ?? "";
      if (!raw) throw new Error("OpenRouter returned empty content");
      return raw;
    }

    lastErrText = await res.text().catch(() => "");

    // Terminal errors — don't retry.
    if (res.status === 401) throw new Error("OpenRouter auth failed — check OPENROUTER_API_KEY.");
    if (res.status === 402) throw new Error("OpenRouter credits exhausted or model requires paid tier.");
    if (res.status === 400 || res.status === 404) {
      throw new Error(`OpenRouter ${res.status}: ${lastErrText.slice(0, 300)}`);
    }

    // Retryable: 429 (rate limit) or 5xx.
    const retryable = res.status === 429 || (res.status >= 500 && res.status < 600);
    if (!retryable || attempt >= maxRetries) {
      if (res.status === 429) {
        // Try to extract daily-limit signal from body for a clearer message.
        const isDaily = /day|daily|per day/i.test(lastErrText);
        if (isDaily) {
          throw new Error(
            "OpenRouter daily limit reached (50/day on free tier, or 1000/day with $10+ credits added). Wait until the daily reset (00:00 UTC) or add $10 credits at openrouter.ai to unlock 1000/day.",
          );
        }
        throw new Error(
          `OpenRouter rate limit — retried ${attempt} times and still 429. Free tier is 20 req/min. Wait a minute and retry, or add $10 credits at openrouter.ai. Body: ${lastErrText.slice(0, 200)}`,
        );
      }
      throw new Error(`OpenRouter ${res.status}: ${lastErrText.slice(0, 300)}`);
    }

    // Compute wait: honor Retry-After header if present, else exponential backoff.
    const retryAfterHeader = res.headers.get("retry-after");
    let waitMs: number;
    if (retryAfterHeader) {
      const asNum = Number(retryAfterHeader);
      waitMs = Number.isFinite(asNum) ? asNum * 1000 : 5000;
    } else {
      // 4s, 8s, 16s, 32s...
      waitMs = Math.min(32000, 4000 * Math.pow(2, attempt));
    }
    // Jitter ±20% to avoid thundering herd.
    waitMs = Math.round(waitMs * (0.8 + Math.random() * 0.4));
    await sleep(waitMs);
    attempt++;
  }
}

/** Extract JSON from a model response — tolerates code fences and prose wrappers. */
export function extractJson(raw: string): unknown {
  const cleaned = raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Model did not return valid JSON");
  }
}
