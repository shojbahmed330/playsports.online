import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/ai-faqs.functions";

interface Props {
  title?: string;
  items: FaqItem[];
}

export function FaqSection({ title = "Frequently Asked Questions", items }: Props) {
  if (!items?.length) return null;
  return (
    <section className="mt-10 border-t border-border/50 pt-8" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold mb-4">
        {title}
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <FaqRow key={i} item={item} defaultOpen={i === 0} />
        ))}
      </div>
    </section>
  );
}

function FaqRow({ item, defaultOpen }: { item: FaqItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-sm sm:text-base">{item.q}</span>
        <ChevronDown
          className={`h-4 w-4 mt-1 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
      )}
    </div>
  );
}
