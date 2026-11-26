import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useIdentitySettings, useNewsletterSettings } from "@/lib/site-settings";
import { subscribeNewsletter } from "@/lib/subscribe.functions";

const SPORTS = [
  { to: "/football", label: "Football", search: undefined as Record<string, unknown> | undefined },
  { to: "/football", label: "World Cup", search: { year: 2026 } },
  { to: "/cricket", label: "Cricket", search: undefined },
  { to: "/cricket/ipl", label: "IPL", search: undefined },
  { to: "/nba", label: "NBA", search: undefined },
  { to: "/mlb", label: "MLB", search: undefined },
  { to: "/nhl", label: "NHL", search: undefined },
  { to: "/mls", label: "MLS", search: undefined },
] as const;

const INFO = [
  { to: "/news", label: "News & Recaps" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/disclaimer", label: "Disclaimer" },
] as const;

export function SiteFooter() {
  const { data: id } = useIdentitySettings();
  const year = new Date().getFullYear();
  const openConsent = () => window.dispatchEvent(new CustomEvent("asl:consent-open"));

  return (
    <footer className="mt-16 px-4 pb-20 sm:pb-8">
      <div className="mx-auto w-full max-w-7xl mb-6 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <form method="get" action="/search" className="flex gap-2 items-center">
          <label htmlFor="site-search" className="sr-only">Search PlaySports</label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search any country, player, year or World Cup…"
            className="flex-1 rounded-xl px-4 py-2.5 text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button type="submit" className="rounded-xl px-4 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90">
            Search
          </button>
        </form>
      </div>
      <div className="mx-auto w-full max-w-7xl bg-card/40 text-muted-foreground rounded-2xl overflow-hidden border border-border shadow-2xl">

        {/* Affiliate strip */}
        <div className="bg-background/40 border-b border-border px-6 py-3">
          <p className="text-xs text-center lg:text-left leading-relaxed">
            <span className="text-indigo-400 font-semibold">Affiliate Disclosure:</span>{" "}
            Some links on this site may earn us a commission at no extra cost to you. This helps support our real-time data infrastructure.
          </p>
        </div>

        {/* Main grid */}
        <div className="px-6 py-10 lg:px-12 lg:py-12">
          <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-12 [&>:first-child]:col-span-3 md:[&>:first-child]:col-span-1">
            {/* Brand + newsletter */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black italic text-foreground tracking-tighter uppercase">
                  Play<span className="text-indigo-500">Sports</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {id?.tagline ??
                    "Live cricket and football scores, tables, stats and match history — fast, accurate, no clutter."}
                </p>
              </div>
              <NewsletterInline />
            </div>

            {/* Live Coverage */}
            <FooterCol title="Live Coverage">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-xs sm:text-sm">
                {SPORTS.map((s) => (
                  <li key={`${s.to}-${s.label}`}>
                    <Link
                      to={s.to}
                      search={s.search as never}
                      className="block py-1.5 hover:text-indigo-400 transition-colors"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterCol>

            {/* Information */}
            <FooterCol title="Information">
              <ul className="text-xs sm:text-sm">
                {INFO.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="block py-1.5 hover:text-indigo-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href="/sitemap.xml"
                    className="block py-1.5 hover:text-indigo-400 transition-colors"
                  >
                    Sitemap
                  </a>
                </li>
                <li>
                  <button
                    onClick={openConsent}
                    className="block py-1.5 text-left w-full hover:text-indigo-400 transition-colors"
                  >
                    Cookie Preferences
                  </button>
                </li>
              </ul>
            </FooterCol>

            {/* Follow */}
            <FooterCol title="Follow Us">
              <div className="flex flex-wrap gap-3">
                {id?.social.x && (
                  <SocialIcon href={id.social.x} label="X / Twitter">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </SocialIcon>
                )}
                {id?.social.youtube && (
                  <SocialIcon href={id.social.youtube} label="YouTube">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </SocialIcon>
                )}
                {id?.social.reddit && (
                  <SocialIcon href={id.social.reddit} label="Reddit">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.04.203.065.414.065.63 0 2.99-3.416 5.415-7.611 5.415s-7.611-2.426-7.611-5.415c0-.211.024-.417.062-.614a1.761 1.761 0 0 1-1.011-1.583c0-.968.786-1.754 1.754-1.754.463 0 .872.181 1.177.473 1.18-.83 2.801-1.378 4.591-1.464l.873-4.103a.511.511 0 0 1 .598-.392l2.951.622a1.248 1.248 0 0 1 .305-.125z" />
                  </SocialIcon>
                )}
                {id?.social.instagram && (
                  <SocialIcon href={id.social.instagram} label="Instagram">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948-.197-4.354-2.612-6.782-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </SocialIcon>
                )}
              </div>
              <p className="mt-6 text-xs text-muted-foreground/80 leading-tight italic">
                PlaySports is not affiliated with any official sports league, team, or athletic organization.
              </p>
            </FooterCol>
          </div>

          {/* Copyright bar */}
          <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs tracking-wide text-muted-foreground text-center md:text-left">
            <p>
              {id?.footer_text?.replace("©", `© ${year}`) ??
                `© ${year} PlaySports Media Group. All rights reserved.`}
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
                <span className="uppercase tracking-widest text-[10px] font-semibold">Live data</span>
              </span>
              <span className="opacity-50" aria-hidden>·</span>
              <span className="uppercase tracking-widest text-[10px]">ESPN · FIFA · ICC</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-foreground mb-3 sm:mb-5 truncate">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-lg bg-background/60 border border-border flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all text-foreground"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {children}
      </svg>
    </a>
  );
}

function NewsletterInline() {
  const { data } = useNewsletterSettings();
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!data?.enabled) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || done) return;
    setBusy(true);
    try {
      const res = await subscribe({ data: { email, source: "footer", hp } });
      if (res?.ok) {
        setDone(true);
        setEmail("");
        toast.success(res.already ? "You're already on the list" : "Subscribed — see you tomorrow!");
      }
    } catch (err) {
      toast.error("Subscribe failed", {
        description: err instanceof Error ? err.message : "Try again later",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-foreground">Stay Updated</p>
      <form onSubmit={onSubmit} className="flex">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          aria-hidden
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-background/60 border border-border rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-foreground"
        />
        <button
          type="submit"
          disabled={busy || done}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1.5 min-w-[68px]"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : done ? (
            <Check className="size-4" />
          ) : (
            "Join"
          )}
        </button>
      </form>
      <p className="text-[11px] text-muted-foreground">One email a day. Unsubscribe anytime.</p>
    </div>
  );
}
