import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FIFA World Cup Archive" },
      { name: "robots", content: "noindex" },
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

  useEffect(() => {
    if (!loading && session) navigate({ to: "/admin", replace: true });
  }, [loading, session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-3.5" /> Back to archive
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex size-12 rounded-xl bg-gold/15 ring-1 ring-gold/30 items-center justify-center">
            <Trophy className="size-6 text-gold" />
          </div>
          <h1 className="text-2xl font-bold mt-3">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Archive management access
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card/60 p-5">
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Email</span>
            <div className="mt-1 relative">
              <Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background border border-input focus:border-gold focus:outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Password</span>
            <div className="mt-1 relative">
              <Lock className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background border border-input focus:border-gold focus:outline-none text-sm"
                placeholder="••••••••"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="text-[10px] text-center text-muted-foreground mt-4">
          Admin access is restricted. New accounts cannot be created from this page.
        </p>

      </div>
    </div>
  );
}
