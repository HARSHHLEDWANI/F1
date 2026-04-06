import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function TracksLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-64 mb-2" />
      <SkeletonText className="w-1/3 mb-10" />

      {/* Search / filter bar */}
      <div className="flex gap-3 mb-8">
        <Skeleton className="h-10 flex-1 rounded" />
        <Skeleton className="h-10 w-32 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-white/5 bg-white/3 overflow-hidden"
          >
            <Skeleton className="h-36 w-full" />
            <div className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-4" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="bg-white/3 rounded p-2">
                    <Skeleton className="h-4 w-1/2 mb-1" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
