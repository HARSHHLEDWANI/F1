import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-5xl mx-auto">
      <Skeleton className="h-10 w-56 mb-2" />
      <SkeletonText className="w-1/2 mb-10" />

      {/* Module list */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex gap-5 border border-white/5 rounded-xl bg-white/3 p-5"
          >
            <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <SkeletonText />
              <SkeletonText className="w-3/4" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-24 rounded self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
