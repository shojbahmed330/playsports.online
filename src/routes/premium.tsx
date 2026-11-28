import { createFileRoute } from "@tanstack/react-router";
import { Check, Crown, Heart, Sparkles } from "lucide-react";
import { useMembership } from "@/hooks/use-membership";
import { CryptoCheckout } from "@/components/premium/CryptoCheckout";
import { canonical } from "@/lib/seo/canonical";

export const Route = createFileRoute("/premium")({
  component: PremiumPage,
  head: () => ({
    meta: [
      { title: "Become a Supporter — PlaySports" },
      {
        name: "description",
        content: "Support PlaySports and enjoy an ad-free experience across every sport hub.",
      },
      { property: "og:title", content: "Become a Supporter — PlaySports" },
      {
        property: "og:description",
        content:
          "Ad-free browsing, priority features, and direct support for independent sports coverage.",
      },
      { property: "og:url", content: canonical("/premium") },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Become a Supporter — PlaySports" },
      {
        name: "twitter:description",
        content: "Support PlaySports and enjoy an ad-free experience across every sport hub.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/premium") }],
  }),
});

function PremiumPage() {
  const { membership } = useMembership();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="text-center mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-caption font-medium text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" /> Independent sports coverage
        </div>
        <h1 className="mb-3 text-h1 text-foreground md:text-display">Support PlaySports</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Keep live scores, player stats, and World Cup coverage free and ad-light for everyone.
          Supporters get an ad-free experience across the entire site.
        </p>
      </header>

      {membership.active && (
        <div className="mb-8 rounded-2xl border border-positive/30 bg-positive/5 p-6 text-center">
          <Crown className="mx-auto mb-2 size-8 text-primary" aria-hidden="true" />
          <p className="font-semibold">
            You're a {membership.tier === "pro" ? "Pro" : "Supporter"} — thank you!
          </p>
          {membership.premium_until && (
            <p className="mt-1 text-caption text-muted-foreground">
              Active until{" "}
              {new Date(membership.premium_until).toLocaleDateString("en-GB", {
                timeZone: "UTC",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <Plan
          name="Free"
          price="$0"
          tone="muted"
          features={[
            "All live scores & fixtures",
            "Player profiles & stats",
            "World Cup archive",
            "Standard ads",
          ]}
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
            <a
              href="#crypto-checkout"
              className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-center font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Heart className="mr-1 inline size-4" aria-hidden="true" /> Pay with USDT (BEP20)
            </a>
          }
        />
      </div>

      <div className="mt-10">
        <CryptoCheckout />
      </div>

      <p className="mt-8 text-center text-caption text-muted-foreground">
        Crypto payments are verified manually by an admin. Premium activates after approval.
      </p>
    </main>
  );
}

function Plan({
  name,
  price,
  features,
  cta,
  tone,
  highlight,
}: {
  name: string;
  price: string;
  features: string[];
  cta: React.ReactNode;
  tone: "muted" | "primary";
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card/40"}`}
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-bold">{name}</h2>
        <div className={`text-h2 font-bold ${tone === "primary" ? "text-primary" : ""}`}>
          {price}
        </div>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-body">
            <Check className="mt-0.5 size-4 shrink-0 text-positive" aria-hidden="true" /> {f}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}
