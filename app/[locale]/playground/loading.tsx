import { Skeleton } from "@/components/ui/skeleton";

export default function PlaygroundLoading() {
  return (
    <main className="mx-auto flex w-full container flex-1 flex-col px-4 py-8">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-5 w-96" />
      <Skeleton className="mt-6 h-8 w-full max-w-md" />
      <Skeleton className="mt-3 min-h-[520px] w-full flex-1" />
    </main>
  );
}
