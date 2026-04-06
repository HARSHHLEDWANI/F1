/**
 * Reusable skeleton / shimmer primitives for loading states.
 * All variants use the same F1-themed dark palette.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/5 ${className}`}
    />
  );
}

/** Full-width text line placeholder */
export function SkeletonText({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-4 w-full ${className}`} />;
}

/** Rectangular card shell */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-white/5 bg-white/3 p-4 ${className}`}
    >
      <Skeleton className="h-40 w-full mb-4" />
      <SkeletonText className="mb-2" />
      <SkeletonText className="w-3/4" />
    </div>
  );
}

/** Horizontal list of stat boxes */
export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex-1 rounded border border-white/5 bg-white/3 p-4"
        >
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}
