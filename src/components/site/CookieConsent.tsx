import { useEffect, useState } from "react";
import { useConsent, readConsent, type ConsentChoice } from "@/lib/consent";
import { useConsentSettings } from "@/lib/site-settings";
import { Link } from "@tanstack/react-router";

export function CookieConsent() {
  const { data: settings } = useConsentSettings();
  const { acceptAll, rejectAll, save } = useConsent();
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [draft, setDraft] = useState<ConsentChoice>(readConsent());

  useEffect(() => {
    if (!settings?.enabled) return;
    const c = readConsent();
    if (!c.decided) setVisible(true);
    const open = () => {
      setDraft(readConsent());
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener("asl:consent-open", open);
    return () => window.removeEventListener("asl:consent-open", open);
  }, [settings?.enabled]);

  if (!settings?.enabled || !visible) return null;

  const close = () => {
    setVisible(false);
    setShowPrefs(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 backdrop-blur shadow-2xl p-4 sm:p-5">
        {!showPrefs ? (
          <>
            <div className="text-sm text-foreground">
              {settings.banner_text}{" "}
              <Link to="/cookies" className="underline text-primary">
                Learn more
              </Link>
              .
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => {
                  rejectAll();
                  close();
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-accent"
              >
                Reject non-essential
              </button>
              <button
                onClick={() => {
                  setDraft(readConsent());
                  setShowPrefs(true);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-accent"
              >
                Manage preferences
              </button>
              <button
                onClick={() => {
                  acceptAll();
                  close();
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400"
              >
                Accept all
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold mb-3">Cookie preferences</div>
            <ul className="space-y-2 text-sm">
              <Row label="Strictly necessary" sub="Required for the site to work." checked disabled />
              <Row
                label="Analytics"
                sub="Helps us understand traffic (Google Analytics 4)."
                checked={draft.analytics}
                onChange={(v) => setDraft({ ...draft, analytics: v })}
              />
              <Row
                label="Advertising"
                sub="Personalized ads via Google AdSense."
                checked={draft.advertising}
                onChange={(v) => setDraft({ ...draft, advertising: v })}
              />
              <Row
                label="Affiliate tracking"
                sub="Lets us credit referrals to partner sites."
                checked={draft.affiliate}
                onChange={(v) => setDraft({ ...draft, affiliate: v })}
              />
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setShowPrefs(false)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-accent"
              >
                Back
              </button>
              <button
                onClick={() => {
                  save({
                    analytics: draft.analytics,
                    advertising: draft.advertising,
                    affiliate: draft.affiliate,
                  });
                  close();
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400"
              >
                Save preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  sub,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-background/50 p-3">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="size-4 mt-0.5 accent-emerald-500"
      />
      <div className="flex-1">
        <div className="text-xs font-semibold">{label}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </li>
  );
}
