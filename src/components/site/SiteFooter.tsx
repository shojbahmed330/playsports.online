import { Link } from "@tanstack/react-router";
import { useIdentitySettings } from "@/lib/site-settings";
import { AffiliateDisclosure } from "@/components/affiliates/AffiliateDisclosure";

const LEGAL = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/cookies", label: "Cookies" },
  { to: "/disclaimer", label: "Disclaimer" },
] as const;

const SPORTS = [
  { to: "/football", label: "Football / World Cup" },
  { to: "/cricket", label: "Cricket" },
  { to: "/cricket/ipl", label: "IPL" },
  { to: "/mlb", label: "MLB" },
  { to: "/nba", label: "NBA" },
  { to: "/nhl", label: "NHL" },
  { to: "/mls", label: "MLS" },
] as const;

export function SiteFooter() {
  const { data: id } = useIdentitySettings();
  const openConsent = () => window.dispatchEvent(new CustomEvent("asl:consent-open"));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-card/30">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <AffiliateDisclosure />
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-bold text-foreground">AllSportsLive</div>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {id?.tagline}
          </p>
        </div>
        <FooterCol title="Sports">
          {SPORTS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="Site">
          {LEGAL.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <a href="/sitemap.xml" className="hover:text-foreground">
            Sitemap
          </a>
          <button
            onClick={openConsent}
            className="text-left hover:text-foreground"
          >
            Cookie preferences
          </button>
        </FooterCol>
        <FooterCol title="Follow">
          {id?.social.x && (
            <a href={id.social.x} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              X / Twitter
            </a>
          )}
          {id?.social.youtube && (
            <a href={id.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              YouTube
            </a>
          )}
          {id?.social.reddit && (
            <a href={id.social.reddit} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              Reddit
            </a>
          )}
          {id?.social.instagram && (
            <a href={id.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              Instagram
            </a>
          )}
        </FooterCol>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 text-[11px] text-muted-foreground flex flex-wrap gap-2 justify-between">
          <span>{id?.footer_text?.replace("©", `© ${year}`) ?? `© ${year} AllSportsLive`}</span>
          <span>Not affiliated with any league or governing body.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-foreground">{title}</div>
      <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">{children}</div>
    </div>
  );
}
