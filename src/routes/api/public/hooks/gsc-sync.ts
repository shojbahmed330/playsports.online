import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://www.playsports.online/";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

type ServiceAccount = {
  client_email?: string;
  private_key?: string;
};

function base64Url(input: string | ArrayBuffer): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function parseServiceAccountJson(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  const candidates = [raw];
  try {
    candidates.push(Buffer.from(raw, "base64").toString("utf8"));
  } catch {}

  for (const value of candidates) {
    try {
      const parsed = JSON.parse(value) as ServiceAccount;
      if (parsed.client_email && parsed.private_key) {
        return { ...parsed, private_key: parsed.private_key.replace(/\\n/g, "\n") };
      }
    } catch {}
  }

  throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid service account JSON");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getServiceAccountAccessToken(account: ServiceAccount): Promise<string> {
  if (!account.client_email || !account.private_key) {
    throw new Error("Service account JSON must include client_email and private_key");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: account.client_email,
    scope: GSC_SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(account.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput));
  const assertion = `${signingInput}.${base64Url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`Google OAuth ${res.status}: ${JSON.stringify(json).slice(0, 400)}`);
  }
  return json.access_token;
}

async function fetchDimDirect(dimensions: string[], startDate: string, endDate: string, accessToken: string) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const rows: any[] = [];
  let startRow = 0;
  const rowLimit = 5000;
  while (true) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, startRow, dataState: "final" }),
    });
    if (!res.ok) throw new Error(`GSC direct ${dimensions.join(",")} ${res.status}: ${await res.text()}`);
    const j: any = await res.json();
    const batch = j?.rows ?? [];
    rows.push(...batch);
    if (batch.length < rowLimit) break;
    startRow += rowLimit;
    if (startRow > 25000) break;
  }
  return rows;
}

async function fetchDim(dimensions: string[], startDate: string, endDate: string) {
  const url = `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const rows: any[] = [];
  let startRow = 0;
  const rowLimit = 5000;
  while (true) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": process.env.GOOGLE_SEARCH_CONSOLE_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, startRow, dataState: "final" }),
    });
    if (!res.ok) throw new Error(`GSC ${dimensions.join(",")} ${res.status}: ${await res.text()}`);
    const j: any = await res.json();
    const batch = j?.rows ?? [];
    rows.push(...batch);
    if (batch.length < rowLimit) break;
    startRow += rowLimit;
    if (startRow > 25000) break;
  }
  return rows;
}

async function createGscFetcher() {
  const serviceAccount = parseServiceAccountJson();
  if (serviceAccount) {
    const accessToken = await getServiceAccountAccessToken(serviceAccount);
    return (dimensions: string[], startDate: string, endDate: string) => fetchDimDirect(dimensions, startDate, endDate, accessToken);
  }

  if (!process.env.LOVABLE_API_KEY || !process.env.GOOGLE_SEARCH_CONSOLE_API_KEY) {
    throw new Error("Missing Google credentials. Add GOOGLE_SERVICE_ACCOUNT_JSON in Vercel, or run sync from Lovable preview.");
  }
  return fetchDim;
}

export const Route = createFileRoute("/api/public/hooks/gsc-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        let body: any = {};
        try { body = await request.json(); } catch {}
        const days = Math.min(Math.max(Number(body?.days) || 3, 1), 28);

        const end = new Date();
        end.setUTCDate(end.getUTCDate() - 2); // GSC data has ~2 day lag
        const start = new Date(end);
        start.setUTCDate(end.getUTCDate() - (days - 1));
        const startDate = start.toISOString().slice(0, 10);
        const endDate = end.toISOString().slice(0, 10);

        const { data: run } = await admin
          .from("seo_sync_runs")
          .insert({ status: "running", date_range_start: startDate, date_range_end: endDate })
          .select("id")
          .single();
        const runId = run?.id;

        try {
          const fetchGscDim = await createGscFetcher();
          // Two pulls: (date,page) and (date,page,query) for query-level insight
          const pageRows = await fetchGscDim(["date", "page"], startDate, endDate);
          const queryRows = await fetchGscDim(["date", "page", "query"], startDate, endDate);

          const upserts: any[] = [];
          for (const r of pageRows) {
            const [date, page] = r.keys;
            upserts.push({
              date, page, query: "",
              clicks: r.clicks ?? 0,
              impressions: r.impressions ?? 0,
              ctr: r.ctr ?? 0,
              position: r.position ?? 0,
            });
          }
          for (const r of queryRows) {
            const [date, page, query] = r.keys;
            if (!query) continue;
            upserts.push({
              date, page, query,
              clicks: r.clicks ?? 0,
              impressions: r.impressions ?? 0,
              ctr: r.ctr ?? 0,
              position: r.position ?? 0,
            });
          }

          // chunked upsert
          let written = 0;
          for (let i = 0; i < upserts.length; i += 500) {
            const chunk = upserts.slice(i, i + 500);
            const { error } = await admin
              .from("seo_gsc_daily")
              .upsert(chunk, { onConflict: "date,page,query" });
            if (error) throw error;
            written += chunk.length;
          }

          await admin.from("seo_sync_runs").update({
            status: "success",
            finished_at: new Date().toISOString(),
            rows_written: written,
          }).eq("id", runId);

          return Response.json({ ok: true, rows_written: written, startDate, endDate });
        } catch (e: any) {
          await admin.from("seo_sync_runs").update({
            status: "error",
            finished_at: new Date().toISOString(),
            error: String(e?.message ?? e).slice(0, 500),
          }).eq("id", runId);
          return Response.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
        }
      },
    },
  },
});
