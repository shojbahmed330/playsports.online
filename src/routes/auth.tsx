import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PlaySports" },
      { name: "robots", content: "noindex" },
      { property: "og:site_name", content: "PlaySports" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/admin", replace: true });
  }, [loading, session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setFormError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign in failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4 py-10">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Checking your session…
        </div>
      </div>
    );
  }

  if (session) return null;

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-6 inline-flex min-h-11 items-center gap-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to archive
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex size-12 rounded-2xl bg-gold/15 ring-1 ring-gold/30 items-center justify-center">
            <Trophy className="size-6 text-gold" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold mt-3">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1">Archive management access</p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-3 rounded-2xl border border-border bg-card/60 p-5"
        >
          {formError && (
            <p
              id="auth-error"
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {formError}
            </p>
          )}
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Email
            </span>
            <div className="mt-1 relative">
              <Mail
                className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-invalid={formError ? true : undefined}
                aria-describedby={formError ? "auth-error" : undefined}
                className="w-full min-h-11 pl-9 pr-3 rounded-xl bg-background border border-input focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Password
            </span>
            <div className="mt-1 relative">
              <Lock
                className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                aria-invalid={formError ? true : undefined}
                aria-describedby={formError ? "auth-error" : undefined}
                className="w-full min-h-11 pl-9 pr-3 rounded-xl bg-background border border-input focus:border-gold focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="••••••••"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-[10px] text-center text-muted-foreground mt-4">
          Admin access is restricted. New accounts cannot be created from this page.
        </p>
      </div>
    </div>
  );
}
