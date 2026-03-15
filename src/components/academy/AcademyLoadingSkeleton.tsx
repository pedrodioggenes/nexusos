import { Skeleton } from "@/components/ui/skeleton";

export function AcademyLoadingSkeleton() {
  return (
    <div className="h-[100dvh] flex bg-background">
      {/* Sidebar Skeleton */}
      <div className="w-[220px] shrink-0 h-full hidden lg:block bg-secondary border-r border-border">
        <div className="p-5 space-y-6">
          <Skeleton className="h-8 w-32 bg-muted" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-hidden">
        {/* Hero Skeleton */}
        <div className="h-[400px] relative bg-secondary">
          <div className="absolute inset-0 flex items-center px-12">
            <div className="space-y-5 max-w-xl">
              <Skeleton className="h-6 w-32 bg-muted" />
              <Skeleton className="h-12 w-96 bg-muted" />
              <Skeleton className="h-16 w-80 bg-muted" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-40 bg-muted" />
                <Skeleton className="h-12 w-32 bg-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections Skeleton */}
        <div className="px-8 py-6 space-y-12">
          {/* Continue Learning */}
          <div>
            <Skeleton className="h-8 w-64 mb-6 bg-muted" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex rounded-2xl overflow-hidden bg-secondary border border-border"
                >
                  <Skeleton className="w-40 aspect-video shrink-0 bg-muted" />
                  <div className="flex-1 p-4 space-y-3">
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-3 w-2/3 bg-muted" />
                    <Skeleton className="h-2 w-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track Section */}
          <div>
            <Skeleton className="h-8 w-32 mb-6 bg-muted" />
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-44 shrink-0">
                  <Skeleton className="aspect-[3/4] rounded-2xl bg-secondary" />
                  <Skeleton className="h-4 w-full mt-3 bg-muted" />
                  <Skeleton className="h-3 w-2/3 mt-2 bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
