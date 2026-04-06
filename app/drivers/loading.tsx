import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function DriversLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-7xl mx-auto">
      {/* Header */}
      <Skeleton className="h-10 w-64 mb-2" />
      <SkeletonText className="w-1/3 mb-10" />

      {/* Driver grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-white/5 bg-white/3 overflow-hidden"
          >
            <Skeleton className="h-48 w-full" />
            <div className="p-3">
              <SkeletonText className="mb-2" />
              <Skeleton className="h-3 w-1/2 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
