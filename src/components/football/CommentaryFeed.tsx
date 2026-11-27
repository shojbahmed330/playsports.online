import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, MessageSquare, Filter } from "lucide-react";
import {
  getWc2026MatchCommentary,
  type Wc2026CommentaryItem,
} from "@/lib/wc2026.functions";

type Filter = "all" | "key";

const KEY_TYPES = new Set([
  "goal", "own_goal", "penalty", "penalty_missed",
  "yellowcard", "redcard", "yellow_red", "substitution", "var",
]);

export function CommentaryFeed({
  matchId,
  live,
  homeCode,
  awayCode,
}: {
  matchId: number;
  live: boolean;
  homeCode: string;
  awayCode: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const q = useQuery({
    queryKey: ["wc2026-commentary", matchId],
    queryFn: () => getWc2026MatchCommentary({ data: { matchId } }),
    refetchInterval: live ? 30_000 : false,
    staleTime: live ? 10_000 : 5 * 60_000,
  });

  const items = useMemo(() => {
    const list = q.data?.items ?? [];
    return filter === "key" ? list.filter((i) => KEY_TYPES.has(i.type)) : list;
  }, [q.data, filter]);

  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-caption text-muted-foreground" role="status">
        <Loader2 className="mr-2 size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading commentary…
      </div>
    );
  }

  if ((q.data?.items ?? []).length === 0) {
    return (
      <div className="py-10 text-center text-caption text-muted-foreground">
        No commentary yet. It usually starts at kickoff.
        {q.data?.error && <div className="mt-1 text-micro text-destructive/60">({q.data.error})</div>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-3.5 text-primary" aria-hidden="true" />
        <span className="text-micro uppercase text-primary/80">
          {items.length} entries
        </span>
        <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted p-0.5 ring-1 ring-border">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>All</FilterBtn>
          <FilterBtn active={filter === "key"} onClick={() => setFilter("key")}>
            <Filter className="mr-0.5 inline size-2.5" aria-hidden="true" /> Key
          </FilterBtn>
        </div>
      </div>

      <ol className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
        {items.map((item) => (
          <CommentaryRow key={item.id} item={item} homeCode={homeCode} awayCode={awayCode} />
        ))}
      </ol>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center rounded-full px-3 text-micro font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function CommentaryRow({ item, homeCode, awayCode }: { item: Wc2026CommentaryItem; homeCode: string; awayCode: string }) {
  const isKey = KEY_TYPES.has(item.type);
  const tag = item.team === "home" ? homeCode : item.team === "away" ? awayCode : null;
  return (
    <li
      className={`flex gap-2 rounded-lg border-l-2 px-2.5 py-1.5 ${
        isKey
          ? "border-primary/70 bg-primary/5"
          : "border-border bg-muted/30"
      }`}
    >
      <div className="w-10 shrink-0 text-right">
        <div className={`text-micro font-black tabular-nums ${isKey ? "text-primary" : "text-muted-foreground"}`}>
          {item.minute != null ? `${item.minute}'` : "—"}
        </div>
        {tag && (
          <div className="mt-0.5 text-micro font-bold uppercase text-muted-foreground/70">
            {tag}
          </div>
        )}
      </div>
      <p className={`flex-1 text-caption leading-snug ${isKey ? "font-medium text-foreground" : "text-muted-foreground"}`}>
        {item.text}
      </p>
    </li>
  );
}
