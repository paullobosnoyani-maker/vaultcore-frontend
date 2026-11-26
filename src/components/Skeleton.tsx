export function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse space-y-4">
      <div className="h-4 w-1/4 bg-white/5 rounded" />
      <div className="h-8 w-1/2 bg-white/5 rounded" />
      <div className="h-3 w-full bg-white/5 rounded" />
      <div className="h-3 w-3/4 bg-white/5 rounded" />
    </div>
  );
}

export function SkeletonTable(rows = 4) {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="px-6 py-3 border-b border-white/5">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 w-3/4 bg-white/5 rounded" />
          ))}
        </div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="px-6 py-3 border-b border-white/5">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-4 w-full bg-white/5 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonWidget() {
  return (
    <div className="glass-card p-6 animate-pulse space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-white/5 rounded" />
        <div className="h-4 w-1/3 bg-white/5 rounded" />
      </div>
      <div className="h-8 w-1/2 bg-white/5 rounded" />
      <div className="h-3 w-full bg-white/5 rounded" />
    </div>
  );
}
