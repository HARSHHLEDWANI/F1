import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#050508] px-6 py-12 max-w-3xl mx-auto">
      <Skeleton className="h-10 w-48 mb-2" />
      <SkeletonText className="w-1/3 mb-10" />

      {/* Avatar + name */}
      <div className="flex items-center gap-6 mb-10">
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-9 w-24 rounded" />
      </div>

      {/* Settings sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse border border-white/5 rounded-xl bg-white/3 p-6 mb-4"
        >
          <Skeleton className="h-5 w-1/3 mb-5" />
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j}>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Skeleton className="h-11 w-full rounded mt-6" />
    </div>
  );
}
