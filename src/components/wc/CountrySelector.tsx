import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { detectCountry, setCountryOverride, COMMON_COUNTRIES } from "@/lib/geo";
import { setTimezoneOverride, isTimezoneOverridden } from "@/lib/timezone";

// ISO-3166 → preferred IANA timezone. Picks the most populous zone per country.
const COUNTRY_TZ: Record<string, string> = {
  US: "America/New_York", GB: "Europe/London", CA: "America/Toronto",
  MX: "America/Mexico_City", BR: "America/Sao_Paulo", AR: "America/Argentina/Buenos_Aires",
  DE: "Europe/Berlin", FR: "Europe/Paris", ES: "Europe/Madrid", IT: "Europe/Rome",
  PT: "Europe/Lisbon", NL: "Europe/Amsterdam", BE: "Europe/Brussels",
  AT: "Europe/Vienna", CH: "Europe/Zurich", AU: "Australia/Sydney",
  NZ: "Pacific/Auckland", IN: "Asia/Kolkata", BD: "Asia/Dhaka",
  PK: "Asia/Karachi", JP: "Asia/Tokyo", KR: "Asia/Seoul",
  SA: "Asia/Riyadh", AE: "Asia/Dubai", QA: "Asia/Qatar",
  ZA: "Africa/Johannesburg", NG: "Africa/Lagos", EG: "Africa/Cairo",
};

/** Header chip that opens a picker to override viewer country. */
export function CountrySelector({ onChange }: { onChange?: (cc: string) => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>("US");

  useEffect(() => { setCurrent(detectCountry()); }, []);

  const currentMeta = COMMON_COUNTRIES.find((c) => c.code === current);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-gray-700 bg-gray-900/60 text-xs h-8"
        >
          <Globe className="size-3.5" />
          <span className="hidden sm:inline">Region:</span>
          <span>{currentMeta?.flag ?? "🌐"} {current}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="size-4" /> Choose your region
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          We use this to show the legal broadcasters where you can watch live in your area.
        </p>
        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
          {COMMON_COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCountryOverride(c.code);
                setCurrent(c.code);
                // Auto-set timezone to this country's default unless the user
                // has already locked one explicitly via the TimezonePicker.
                const tz = COUNTRY_TZ[c.code];
                if (tz && !isTimezoneOverridden()) setTimezoneOverride(tz);
                onChange?.(c.code);
                setOpen(false);
              }}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                current === c.code
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-gray-800 bg-gray-900/40 hover:bg-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{c.flag}</span>
                <span className="text-xs">{c.name}</span>
              </span>
              {current === c.code && <Check className="size-4 text-amber-400" />}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
