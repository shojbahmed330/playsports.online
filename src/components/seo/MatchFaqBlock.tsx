import { FaqSection } from "@/components/seo/FaqSection";
import { buildMatchFaqs, type MatchFaqInput } from "@/lib/seo/match-faqs";

export function MatchFaqBlock(props: MatchFaqInput) {
  const items = buildMatchFaqs(props);
  if (items.length === 0) return null;
  return <FaqSection title="Match FAQs" items={items} />;
}
