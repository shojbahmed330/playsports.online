import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { detectCountry, setCountryOverride, COMMON_COUNTRIES } from "@/lib/geo";

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
