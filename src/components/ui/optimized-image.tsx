import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
}

// Helper to generate WebP URL from original image URL
const getWebPUrl = (src: string | undefined): string | null => {
  if (!src) return null;
  
  // Skip if already WebP or is a data URL/SVG
  if (src.includes('.webp') || src.startsWith('data:') || src.includes('.svg')) {
    return null;
  }
  
  // For WordPress images, try common WebP patterns
  // Pattern 1: image.jpg -> image.jpg.webp (WebP Express plugin)
  // Pattern 2: image.jpg -> image.webp (some CDNs)
  if (src.match(/\.(jpg|jpeg|png)(\?.*)?$/i)) {
    return src.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
  }
  
  return null;
};

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ className, src, alt, fallback = "/placeholder.svg", onError, onLoad, fetchPriority, sizes, ...props }, ref) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(src);
    const [webpFailed, setWebpFailed] = React.useState(false);

    const webpUrl = React.useMemo(() => getWebPUrl(src), [src]);

    React.useEffect(() => {
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
      setWebpFailed(false);
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

    const handleWebpError = () => {
      // WebP failed, let browser fall back to original format
      setWebpFailed(true);
    };

    const imgElement = (
      <img
        ref={ref}
        src={hasError ? fallback : imageSrc}
        alt={alt}
        loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
        decoding={fetchPriority === 'high' ? 'sync' : 'async'}
        fetchPriority={fetchPriority}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        {...props}
      />
    );

    return (
      <div className={cn("relative overflow-hidden", className)}>
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        {webpUrl && !webpFailed && !hasError ? (
          <picture>
            <source 
              srcSet={webpUrl} 
              type="image/webp"
              onError={handleWebpError as any}
            />
            {imgElement}
          </picture>
        ) : (
          imgElement
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";
