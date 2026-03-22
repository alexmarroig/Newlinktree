import { Skeleton } from "@/components/ui/skeleton";

export default function PublicPageLoading() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[680px] px-6 py-8">
      {/* Hero skeleton */}
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full max-w-sm" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Botões skeleton */}
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
