import { Skeleton, SkeletonText, SkeletonStats } from "@/components/ui/Skeleton";

export default function DriverDetailLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-5xl mx-auto">
      {/* Back link */}
      <Skeleton className="h-4 w-24 mb-8" />

      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <Skeleton className="h-72 w-full md:w-64 rounded-xl shrink-0" />
        <div className="flex-1 space-y-4 pt-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-5 w-1/4 mb-2" />
          <SkeletonStats count={3} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse border border-white/5 rounded-lg p-4 bg-white/3">
            <Skeleton className="h-7 w-1/2 mb-1" />
            <SkeletonText className="w-3/4" />
          </div>
        ))}
      </div>

      {/* 3D / chart placeholder */}
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
