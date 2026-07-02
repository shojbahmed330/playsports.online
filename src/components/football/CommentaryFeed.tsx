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
      <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
        <Loader2 className="size-4 animate-spin mr-2" /> Loading commentary…
      </div>
    );
  }

  if ((q.data?.items ?? []).length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-500">
        No commentary yet. It usually starts at kickoff.
        {q.data?.error && <div className="mt-1 text-[10px] text-red-400/60">({q.data.error})</div>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-3.5 text-amber-300" />
        <span className="text-[10px] uppercase tracking-widest text-amber-200/80 font-bold">
          {items.length} entries
        </span>
        <div className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/40 ring-1 ring-white/10 p-0.5">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>All</FilterBtn>
          <FilterBtn active={filter === "key"} onClick={() => setFilter("key")}>
            <Filter className="size-2.5 inline mr-0.5" /> Key
          </FilterBtn>
        </div>
      </div>

      <ol className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
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
      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full transition ${
        active ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"
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
      className={`flex gap-2 rounded-lg px-2.5 py-1.5 border-l-2 ${
        isKey
          ? "bg-amber-500/[0.06] border-amber-400/70"
          : "bg-white/[0.02] border-white/10"
      }`}
    >
      <div className="w-10 shrink-0 text-right">
        <div className={`text-[11px] font-black tabular-nums ${isKey ? "text-amber-300" : "text-gray-400"}`}>
          {item.minute != null ? `${item.minute}'` : "—"}
        </div>
        {tag && (
          <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600 mt-0.5">
            {tag}
          </div>
        )}
      </div>
      <p className={`flex-1 text-xs leading-snug ${isKey ? "text-white font-medium" : "text-gray-300"}`}>
        {item.text}
      </p>
    </li>
  );
}
