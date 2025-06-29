
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';

interface DisqusCommentsProps {
  url: string;
  identifier: string;
  title: string;
}

export const DisqusComments = ({ url, identifier, title }: DisqusCommentsProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px 0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const loadDisqus = () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);

    // Configure Disqus
    window.disqus_config = function () {
      this.page.url = url;
      this.page.identifier = identifier;
      this.page.title = title;
    };

    // Load Disqus script
    const script = document.createElement('script');
    script.src = 'https://azfanpage.disqus.com/embed.js';
    script.setAttribute('data-timestamp', String(+new Date()));
    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      setIsLoading(false);
      console.error('Failed to load Disqus');
    };

    document.head.appendChild(script);
  };

  // Auto-load when visible (optional - can be removed if you want manual loading only)
  useEffect(() => {
    if (isVisible && !isLoaded && !isLoading) {
      // Uncomment the line below if you want auto-loading when scrolled into view
      // loadDisqus();
    }
  }, [isVisible, isLoaded, isLoading]);

  return (
    <div ref={containerRef} className="mt-8 pt-6 border-t border-premium-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        <h3 className="headline-premium text-headline-sm mb-4 text-az-black dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-az-red" />
          Reacties
        </h3>
        
        {!isLoaded && !isLoading && (
          <div className="text-center py-8">
            <p className="body-premium text-body-md text-premium-gray-600 dark:text-gray-300 mb-4">
              Deel je mening over dit artikel met andere AZ fans
            </p>
            <Button
              onClick={loadDisqus}
              className="bg-az-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
            >
              <MessageCircle className="w-4 h-4" />
              Reacties laden
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-az-red mx-auto mb-4" />
            <p className="body-premium text-body-sm text-premium-gray-600 dark:text-gray-300">
              Reacties worden geladen...
            </p>
          </div>
        )}

        {isLoaded && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-100 dark:border-gray-700 overflow-hidden">
            <div id="disqus_thread" className="p-4"></div>
          </div>
        )}

        {/* Disqus branding note */}
        {isLoaded && (
          <div className="text-center mt-4">
            <p className="text-xs text-premium-gray-400 dark:text-gray-500">
              Powered by Disqus
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Type declaration for Disqus global configuration
declare global {
  interface Window {
    disqus_config?: () => void;
  }
}
