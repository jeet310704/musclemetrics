export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[2rem] border bg-white p-5 shadow">
      <Skeleton className="h-5 w-28 mb-4" />
      <Skeleton className="h-10 w-20 mb-3" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-[2rem] border bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-3" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}