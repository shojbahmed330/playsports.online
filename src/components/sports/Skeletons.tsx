export function GameCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden animate-pulse">
      <div className="h-7 bg-gray-800/40 border-b border-gray-800" />
      <div className="space-y-3 p-3">
        <SkelTeam />
        <SkelTeam />
      </div>
      <div className="h-5 bg-gray-800/30 border-t border-gray-800" />
    </div>
  );
}

function SkelTeam() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-7 rounded bg-gray-800" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-2/3 rounded bg-gray-800" />
        <div className="h-2 w-1/4 rounded bg-gray-800/60" />
      </div>
      <div className="size-6 rounded bg-gray-800" />
    </div>
  );
}

export function GameGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => <GameCardSkeleton key={i} />)}
    </div>
  );
}

export function StandingsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 space-y-3 animate-pulse">
          <div className="h-4 w-32 rounded bg-gray-800" />
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <div className="size-5 rounded bg-gray-800" />
              <div className="h-3 flex-1 rounded bg-gray-800/70" />
              <div className="h-3 w-10 rounded bg-gray-800/70" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
