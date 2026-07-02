import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Crown, Heart, Sparkles } from "lucide-react";
import { useMembership } from "@/hooks/use-membership";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/premium")({
  component: PremiumPage,
  head: () => ({
    meta: [
      { title: "Become a Supporter — PlaySports" },
      { name: "description", content: "Support PlaySports and enjoy an ad-free experience across every sport hub." },
      { property: "og:title", content: "Become a Supporter — PlaySports" },
      { property: "og:description", content: "Ad-free browsing, priority features, and direct support for independent sports coverage." },
    ],
  }),
});

function PremiumPage() {
  const { session } = useAuth();
  const { membership } = useMembership();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium mb-4">
          <Sparkles className="size-3.5" /> Independent sports coverage
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Support PlaySports</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Keep live scores, player stats, and World Cup coverage free and ad-light for everyone.
          Supporters get an ad-free experience across the entire site.
        </p>
      </header>

      {membership.active && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center mb-8">
          <Crown className="size-8 text-amber-400 mx-auto mb-2" />
          <p className="font-semibold">You're a {membership.tier === "pro" ? "Pro" : "Supporter"} — thank you!</p>
          {membership.premium_until && (
            <p className="text-xs text-muted-foreground mt-1">
              Active until {new Date(membership.premium_until).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <Plan
          name="Free"
          price="$0"
          tone="muted"
          features={["All live scores & fixtures", "Player profiles & stats", "World Cup archive", "Standard ads"]}
          cta={null}
        />
        <Plan
          name="Supporter"
          price="$3/mo"
          tone="primary"
          highlight
          features={[
            "Everything in Free",
            "Ad-free across all hubs",
            "Priority access to new features",
            "Supporter badge",
            "Cancel anytime",
          ]}
          cta={
            session ? (
              <a
                href="mailto:rajshahi.jibon@gmail.com?subject=PlaySports Supporter"
                className="block w-full text-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium"
              >
                <Heart className="inline size-4 mr-1" /> Become a Supporter
              </a>
            ) : (
              <Link to="/auth" className="block w-full text-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium">
                Sign in to support
              </Link>
            )
          }
        />
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Online checkout activates once payments are connected. Until then, contact us to be added manually — instant ad-free access.
      </p>
    </main>
  );
}

function Plan({
  name, price, features, cta, tone, highlight,
}: { name: string; price: string; features: string[]; cta: React.ReactNode; tone: "muted" | "primary"; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card/40"}`}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-bold">{name}</h2>
        <div className={`text-2xl font-bold ${tone === "primary" ? "text-primary" : ""}`}>{price}</div>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm">
            <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}
