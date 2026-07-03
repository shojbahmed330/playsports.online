// OpenRouter chat helper. Server-only.
// Model: openai/gpt-oss-120b:free via https://openrouter.ai/api/v1
// Note: :free models have strict rate/day limits — handlers should batch gently.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function callOpenRouter(opts: {
  system: string;
  user: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
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

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      // OpenRouter attribution headers (optional but recommended).
      "HTTP-Referer": "https://allsportslive.lovable.app",
      "X-Title": "PlaySports",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("OpenRouter rate limit hit — free tier is ~20 req/min, 50/day. Wait and retry.");
    if (res.status === 402) throw new Error("OpenRouter credits exhausted or model requires paid tier.");
    if (res.status === 401) throw new Error("OpenRouter auth failed — check OPENROUTER_API_KEY.");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content ?? "";
  if (!raw) throw new Error("OpenRouter returned empty content");
  return raw;
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
    // Try to find first {...} block
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Model did not return valid JSON");
  }
}
