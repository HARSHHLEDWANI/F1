import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function PredictionLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-5xl mx-auto">
      <Skeleton className="h-10 w-72 mb-2" />
      <SkeletonText className="w-1/2 mb-10" />

      {/* Race selector */}
      <div className="flex gap-4 mb-10">
        <Skeleton className="h-10 flex-1 rounded" />
        <Skeleton className="h-10 w-40 rounded" />
      </div>

      {/* Podium cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map((pos) => (
          <div
            key={pos}
            className="animate-pulse rounded-xl border border-white/5 bg-white/3 p-6"
          >
            <Skeleton className="h-8 w-12 mb-4 mx-auto" />
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto mb-4" />
            <div className="space-y-2">
              <SkeletonText />
              <SkeletonText className="w-3/4" />
            </div>
          </div>
        ))}
      </div>

      {/* Confidence chart */}
      <div className="border border-white/5 rounded-xl p-6 bg-white/3">
        <Skeleton className="h-5 w-48 mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className={`h-4 rounded-full`} style={{ width: `${40 + i * 12}%` }} />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
