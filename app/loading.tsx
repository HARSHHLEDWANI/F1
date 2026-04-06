import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-20">
        <Skeleton className="h-6 w-40 mx-auto mb-4" />
        <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-16 w-2/3 mx-auto mb-6" />
        <Skeleton className="h-4 w-1/2 mx-auto mb-8" />
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-12 w-40 rounded" />
          <Skeleton className="h-12 w-40 rounded" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse border border-white/5 rounded-lg p-6 bg-white/3">
            <Skeleton className="h-10 w-1/2 mb-2" />
            <SkeletonText className="w-3/4" />
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Leaderboard */}
      <div className="border border-white/5 rounded-lg p-6 bg-white/3">
        <Skeleton className="h-6 w-48 mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 mb-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <SkeletonText className="flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
