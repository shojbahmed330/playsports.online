import { useEffect, useState } from "react";
import { Loader2, Save, Check, Settings2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  saveSetting,
  useAnalyticsSettings,
  useConsentSettings,
  useNewsletterSettings,
  useIdentitySettings,
  useContactSettings,
  useLegalPage,
  DEFAULT_ANALYTICS,
  DEFAULT_CONSENT,
  DEFAULT_NEWSLETTER,
  DEFAULT_IDENTITY,
  DEFAULT_CONTACT,
  DEFAULT_LEGAL,
  type AnalyticsSettings,
  type ConsentSettings,
  type NewsletterSettings,
  type IdentitySettings,
  type ContactSettings,
  type LegalKey,
  type LegalPage,
} from "@/lib/site-settings";

export function MonetizationCard() {
  return (
    <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-transparent p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-lg bg-sky-500/15 grid place-items-center ring-1 ring-sky-500/30 shrink-0">
          <Settings2 className="size-4 text-sky-400" />
        </div>
        <div>
          <div className="text-sm font-semibold">Monetization &amp; Site</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Everything AdSense, Mediavine, and affiliate networks require — plus editable copy for every legal/info page.
          </div>
        </div>
      </div>

      <Section title="Google Analytics 4 / GTM / Search Console">
        <AnalyticsForm />
      </Section>
      <Section title="Cookie Consent Banner">
        <ConsentForm />
      </Section>
      <Section title="Newsletter">
        <NewsletterForm />
      </Section>
      <Section title="Legal Pages (editable)">
        <LegalForms />
      </Section>
      <Section title="About / Contact">
        <ContactAboutForm />
      </Section>
      <Section title="Site Identity & Footer">
        <IdentityForm />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-background/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
      >
        <span>{title}</span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function useSaver<T>(key: string, queryKey: string) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = async (value: T) => {
    setSaving(true);
    try {
      await saveSetting(key, value);
      qc.invalidateQueries({ queryKey: ["site_settings", queryKey] });
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      toast.success("Saved");
    } catch (e) {
      toast.error("Save failed", { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };
  return { save, saving, saved };
}

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 inline-flex items-center gap-1.5"
    >
      {saving ? <Loader2 className="size-3.5 animate-spin" /> : saved ? <Check className="size-3.5" /> : <Save className="size-3.5" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{children}</span>;
}

function txt(cls = "") {
  return `w-full px-3 py-2 text-sm rounded-lg bg-background border border-input focus:border-emerald-500 focus:outline-none ${cls}`;
}

// -------- Analytics --------
function AnalyticsForm() {
  const { data } = useAnalyticsSettings();
  const [f, setF] = useState<AnalyticsSettings>(DEFAULT_ANALYTICS);
  const { save, saving, saved } = useSaver<AnalyticsSettings>("analytics", "analytics");
  useEffect(() => { if (data) setF(data); }, [data]);
  return (
    <div className="space-y-3">
      <label className="inline-flex items-center gap-2 text-xs">
        <input type="checkbox" className="size-4 accent-emerald-500" checked={f.enabled} onChange={(e) => setF({ ...f, enabled: e.target.checked })} />
        <span>Enable analytics (respects cookie consent)</span>
      </label>
      <label className="block"><Lbl>GA4 Measurement ID</Lbl><input className={txt("mt-1 font-mono")} placeholder="G-XXXXXXXXXX" value={f.ga4_measurement_id} onChange={(e) => setF({ ...f, ga4_measurement_id: e.target.value })} /></label>
      <label className="block"><Lbl>GTM Container ID (optional)</Lbl><input className={txt("mt-1 font-mono")} placeholder="GTM-XXXXXXX" value={f.gtm_container_id} onChange={(e) => setF({ ...f, gtm_container_id: e.target.value })} /></label>
      <label className="block"><Lbl>Search Console verification</Lbl><input className={txt("mt-1 font-mono")} placeholder="meta content value" value={f.gsc_verification} onChange={(e) => setF({ ...f, gsc_verification: e.target.value })} /></label>
      <div className="flex justify-end"><SaveBtn saving={saving} saved={saved} onClick={() => save(f)} /></div>
    </div>
  );
}

// -------- Consent --------
function ConsentForm() {
  const { data } = useConsentSettings();
  const [f, setF] = useState<ConsentSettings>(DEFAULT_CONSENT);
  const { save, saving, saved } = useSaver<ConsentSettings>("consent", "consent");
  useEffect(() => { if (data) setF(data); }, [data]);
  return (
    <div className="space-y-3">
      <label className="inline-flex items-center gap-2 text-xs">
        <input type="checkbox" className="size-4 accent-emerald-500" checked={f.enabled} onChange={(e) => setF({ ...f, enabled: e.target.checked })} />
        <span>Show cookie banner</span>
      </label>
      <label className="block"><Lbl>Banner text</Lbl><textarea rows={3} className={txt("mt-1")} value={f.banner_text} onChange={(e) => setF({ ...f, banner_text: e.target.value })} /></label>
      <div className="flex justify-end"><SaveBtn saving={saving} saved={saved} onClick={() => save(f)} /></div>
    </div>
  );
}

// -------- Newsletter --------
function NewsletterForm() {
  const { data } = useNewsletterSettings();
  const [f, setF] = useState<NewsletterSettings>(DEFAULT_NEWSLETTER);
  const { save, saving, saved } = useSaver<NewsletterSettings>("newsletter", "newsletter");
  useEffect(() => { if (data) setF(data); }, [data]);
  return (
    <div className="space-y-3">
      <label className="inline-flex items-center gap-2 text-xs">
        <input type="checkbox" className="size-4 accent-emerald-500" checked={f.enabled} onChange={(e) => setF({ ...f, enabled: e.target.checked })} />
        <span>Show newsletter signup</span>
      </label>
      <label className="block"><Lbl>Mode</Lbl>
        <select className={txt("mt-1")} value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value as NewsletterSettings["mode"] })}>
          <option value="native">Native capture (DB)</option>
          <option value="beehiiv">Beehiiv embed</option>
        </select>
      </label>
      {f.mode === "beehiiv" && (
        <label className="block"><Lbl>Beehiiv publication ID</Lbl><input className={txt("mt-1 font-mono")} placeholder="pub_xxx" value={f.beehiiv_pub_id} onChange={(e) => setF({ ...f, beehiiv_pub_id: e.target.value })} /></label>
      )}
      <label className="block"><Lbl>Headline</Lbl><input className={txt("mt-1")} value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} /></label>
      <label className="block"><Lbl>Sub-headline</Lbl><textarea rows={2} className={txt("mt-1")} value={f.sub} onChange={(e) => setF({ ...f, sub: e.target.value })} /></label>
      <div className="flex justify-end"><SaveBtn saving={saving} saved={saved} onClick={() => save(f)} /></div>
    </div>
  );
}

// -------- Legal --------
const LEGAL_LABELS: Record<LegalKey, string> = {
  legal_privacy: "Privacy Policy",
  legal_terms: "Terms of Service",
  legal_cookies: "Cookie Policy",
  legal_disclaimer: "Disclaimer",
  legal_about: "About",
};
function LegalForms() {
  const [active, setActive] = useState<LegalKey>("legal_privacy");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(LEGAL_LABELS) as LegalKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-2.5 py-1 text-[11px] rounded-md border ${active === k ? "bg-emerald-500 text-black border-emerald-500" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {LEGAL_LABELS[k]}
          </button>
        ))}
      </div>
      <LegalEditor key={active} keyName={active} />
    </div>
  );
}
function LegalEditor({ keyName }: { keyName: LegalKey }) {
  const { data } = useLegalPage(keyName);
  const [f, setF] = useState<LegalPage>(DEFAULT_LEGAL);
  const { save, saving, saved } = useSaver<LegalPage>(keyName, keyName);
  useEffect(() => { if (data) setF(data); }, [data]);
  return (
    <div className="space-y-2">
      <Lbl>Body — simple markdown ## heading, - list, **bold**</Lbl>
      <textarea rows={14} className={txt("font-mono text-xs")} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      <div className="flex justify-end"><SaveBtn saving={saving} saved={saved} onClick={() => save(f)} /></div>
    </div>
  );
}

// -------- Contact (settings only — inbox lives elsewhere later) --------
function ContactAboutForm() {
  const { data } = useContactSettings();
  const [f, setF] = useState<ContactSettings>(DEFAULT_CONTACT);
  const { save, saving, saved } = useSaver<ContactSettings>("contact", "contact");
  useEffect(() => { if (data) setF(data); }, [data]);
  return (
    <div className="space-y-3">
      <label className="block"><Lbl>Public contact email</Lbl><input className={txt("mt-1")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label className="block"><Lbl>Expected response time</Lbl><input className={txt("mt-1")} value={f.response_time} onChange={(e) => setF({ ...f, response_time: e.target.value })} /></label>
      <p className="text-[11px] text-muted-foreground">
        Inbound messages land in <code>contact_messages</code> (admin-only). About copy is in the Legal Pages tab.
      </p>
      <div className="flex justify-end"><SaveBtn saving={saving} saved={saved} onClick={() => save(f)} /></div>
    </div>
  );
}

// -------- Identity --------
function IdentityForm() {
  const { data } = useIdentitySettings();
  const [f, setF] = useState<IdentitySettings>(DEFAULT_IDENTITY);
  const { save, saving, saved } = useSaver<IdentitySettings>("identity", "identity");
  useEffect(() => { if (data) setF(data); }, [data]);
  return (
    <div className="space-y-3">
      <label className="block"><Lbl>Tagline</Lbl><input className={txt("mt-1")} value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></label>
      <label className="block"><Lbl>Footer text</Lbl><input className={txt("mt-1")} value={f.footer_text} onChange={(e) => setF({ ...f, footer_text: e.target.value })} /></label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="block"><Lbl>X / Twitter URL</Lbl><input className={txt("mt-1")} value={f.social.x} onChange={(e) => setF({ ...f, social: { ...f.social, x: e.target.value } })} /></label>
        <label className="block"><Lbl>YouTube URL</Lbl><input className={txt("mt-1")} value={f.social.youtube} onChange={(e) => setF({ ...f, social: { ...f.social, youtube: e.target.value } })} /></label>
        <label className="block"><Lbl>Reddit URL</Lbl><input className={txt("mt-1")} value={f.social.reddit} onChange={(e) => setF({ ...f, social: { ...f.social, reddit: e.target.value } })} /></label>
        <label className="block"><Lbl>Instagram URL</Lbl><input className={txt("mt-1")} value={f.social.instagram} onChange={(e) => setF({ ...f, social: { ...f.social, instagram: e.target.value } })} /></label>
      </div>
      <div className="flex justify-end"><SaveBtn saving={saving} saved={saved} onClick={() => save(f)} /></div>
    </div>
  );
}
