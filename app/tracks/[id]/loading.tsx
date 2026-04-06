import { Skeleton, SkeletonText, SkeletonStats } from "@/components/ui/Skeleton";

export default function TrackDetailLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-5xl mx-auto">
      <Skeleton className="h-4 w-24 mb-8" />

      {/* Hero banner */}
      <Skeleton className="h-56 w-full rounded-xl mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Track info */}
        <div>
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-6" />
          <SkeletonStats count={2} />
        </div>
        {/* Circuit minimap */}
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Lap record + stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse border border-white/5 rounded-lg p-4 bg-white/3">
            <Skeleton className="h-7 w-2/3 mb-1" />
            <SkeletonText className="w-3/4" />
          </div>
        ))}
      </div>

      {/* 3D model */}
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}
