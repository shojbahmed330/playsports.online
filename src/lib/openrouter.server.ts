// AI chat helper. Server-only.
// Prefers Lovable AI Gateway (no per-user key, generous free tier during promo).
// Falls back to OpenRouter free tier if LOVABLE_API_KEY is missing.

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default model on Lovable Gateway — fast, free during promo, JSON-mode capable.
const LOVABLE_MODEL = "google/gemini-2.5-flash";
const OPENROUTER_MODEL_FALLBACK = "openai/gpt-oss-120b:free";

// Kept for backward compat with existing callers that pass a specific model.
export const OPENROUTER_MODEL = LOVABLE_MODEL;

type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function callOpenRouter(opts: {
  system: string;
  user: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  const useLovable = !!lovableKey;
  if (!useLovable && !openrouterKey) {
    throw new Error("Missing LOVABLE_API_KEY (and no OPENROUTER_API_KEY fallback).");
  }

  const messages: Msg[] = [
    { role: "system", content: opts.system },
    { role: "user", content: opts.user },
  ];

  // Force gateway-appropriate model when the caller passed the old OpenRouter-only id.
  const requested = opts.model;
  const model = useLovable
    ? (requested && !requested.includes(":free") ? requested : LOVABLE_MODEL)
    : (requested ?? OPENROUTER_MODEL_FALLBACK);

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const url = useLovable ? LOVABLE_URL : OPENROUTER_URL;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${useLovable ? lovableKey : openrouterKey}`,
  };
  if (!useLovable) {
    headers["HTTP-Referer"] = "https://allsportslive.lovable.app";
    headers["X-Title"] = "PlaySports";
  }

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

  if (!res.ok) {
    const text = await res.text();
    const provider = useLovable ? "Lovable AI" : "OpenRouter";
    if (res.status === 429) throw new Error(`${provider} rate limit hit — slow down and retry.`);
    if (res.status === 402) throw new Error(`${provider} credits exhausted — add credits in workspace billing.`);
    if (res.status === 401) throw new Error(`${provider} auth failed — check API key.`);
    throw new Error(`${provider} ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content ?? "";
  if (!raw) throw new Error("Model returned empty content");
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
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Model did not return valid JSON");
  }
}
