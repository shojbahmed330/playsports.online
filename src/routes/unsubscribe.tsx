import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { unsubscribeByToken } from "@/lib/digest.functions";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubPage,
  head: () => ({
    meta: [
      { title: "Unsubscribe — PlaySports" },
      { name: "robots", content: "noindex" },
      { property: "og:site_name", content: "PlaySports" },
    ],
  }),
});

function UnsubPage() {
  const fn = useServerFn(unsubscribeByToken);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(t);
  }, []);

  async function confirm() {
    if (!token) return;
    setState("loading");
    try {
      const r = await fn({ data: { token } });
      setEmail(r.email);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-3">Unsubscribe</h1>
      {state === "idle" && (
        <>
          <p className="mb-6 text-muted-foreground">
            Click confirm to stop receiving the PlaySports weekly digest.
          </p>
          <button
            type="button"
            disabled={!token}
            onClick={confirm}
            className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Confirm unsubscribe
          </button>
          {!token && (
            <p className="mt-4 text-xs text-destructive" role="alert">
              Missing token in URL.
            </p>
          )}
        </>
      )}
      {state === "loading" && (
        <p className="inline-flex items-center gap-2 text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Working…
        </p>
      )}
      {state === "done" && (
        <p className="text-emerald-500" role="status">
          {email ? `${email} has been unsubscribed.` : "Already unsubscribed."}
        </p>
      )}
      {state === "error" && (
        <div role="alert">
          <p className="text-destructive">Something went wrong. Try again.</p>
          <button
            type="button"
            onClick={confirm}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try again
          </button>
        </div>
      )}
    </main>
  );
}
