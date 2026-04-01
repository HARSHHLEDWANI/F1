export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden animate-pulse">
      <div className="h-44 bg-white/5" />
      <div className="p-6 space-y-4">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-7 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-1/2 bg-white/5 rounded" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-16 bg-white/5 rounded-xl" />
          <div className="h-16 bg-white/5 rounded-xl" />
        </div>
        <div className="h-10 bg-white/5 rounded-xl mt-4" />
      </div>
    </div>
  );
}
