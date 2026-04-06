import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function SimulationsLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-64 mb-2" />
      <SkeletonText className="w-1/2 mb-10" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-white/5 bg-white/3 overflow-hidden"
          >
            <Skeleton className="h-44 w-full" />
            <div className="p-5">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <SkeletonText className="mb-1" />
              <SkeletonText className="w-3/4 mb-5" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
