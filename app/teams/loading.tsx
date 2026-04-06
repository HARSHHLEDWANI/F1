import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function TeamsLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-7xl mx-auto">
      <Skeleton className="h-10 w-64 mb-2" />
      <SkeletonText className="w-1/3 mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-white/5 bg-white/3 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-14 w-14 rounded" />
              <div className="flex-1">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-8 w-16 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="bg-white/3 rounded p-3">
                  <Skeleton className="h-6 w-1/2 mb-1" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
