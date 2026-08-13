import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_220px]">
      <div className="hidden space-y-3 lg:block">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-screen w-full" />
      </div>
      <div className="hidden space-y-2 xl:block">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
