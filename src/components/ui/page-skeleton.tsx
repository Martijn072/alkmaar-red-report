import { Skeleton } from "@/components/ui/skeleton";

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="px-s py-s">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <div className="flex items-center gap-s">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="container mx-auto px-s py-m">
        <Skeleton className="h-8 w-48 mb-m" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-m">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-s">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
