import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ className, src, alt, fallback = "/placeholder.svg", onError, onLoad, ...props }, ref) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(src);

    React.useEffect(() => {
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      onLoad?.(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setHasError(true);
      setIsLoading(false);
      setImageSrc(fallback);
      onError?.(e);
    };

    return (
      <div className={cn("relative overflow-hidden", className)}>
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          ref={ref}
          src={hasError ? fallback : imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
