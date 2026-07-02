import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { unsubscribeByToken } from "@/lib/digest.functions";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubPage,
  head: () => ({
    meta: [
      { title: "Unsubscribe — PlaySports" },
      { name: "robots", content: "noindex" },
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
          <p className="text-muted-foreground mb-6">
            Click confirm to stop receiving the PlaySports weekly digest.
          </p>
          <button
            disabled={!token}
            onClick={confirm}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            Confirm unsubscribe
          </button>
          {!token && <p className="mt-4 text-xs text-destructive">Missing token in URL.</p>}
        </>
      )}
      {state === "loading" && <p>Working…</p>}
      {state === "done" && (
        <p className="text-emerald-500">
          {email ? `${email} has been unsubscribed.` : "Already unsubscribed."}
        </p>
      )}
      {state === "error" && <p className="text-destructive">Something went wrong. Try again.</p>}
    </main>
  );
}
