
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';

interface DisqusCommentsProps {
  slug: string;
  title: string;
  articleId: string; // Add articleId prop
}

export const DisqusComments = ({ slug, title, articleId }: DisqusCommentsProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const loadDisqus = async () => {
    if (isLoaded || isLoading) return;
    
    console.log('Starting Disqus load process...');
    setIsLoading(true);
    setError(null);

    // WordPress URL format for consistency with existing comments
    const wordpressUrl = `https://www.azfanpage.nl/${slug}/`;
    
    console.log('Disqus Configuration:', {
      identifier: articleId, // Use articleId as identifier instead of slug
      url: wordpressUrl,
      title: title
    });

    // Wait a bit to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if thread container exists after timeout
    const threadContainer = document.getElementById('disqus_thread');
    if (!threadContainer) {
      console.error('Disqus thread container still not found after timeout');
      setError('Could not find comments container');
      setIsLoading(false);
      return;
    }

    console.log('Disqus thread container found, proceeding with script load...');

    // Clean up any existing Disqus
    if (window.DISQUS) {
      console.log('Cleaning up existing Disqus instance...');
      window.DISQUS.reset({
        reload: true,
        config: function () {
          this.page.url = wordpressUrl;
          this.page.identifier = articleId; // Use articleId as identifier
          this.page.title = title;
        }
      });
      setIsLoaded(true);
      setIsLoading(false);
      return;
    }

    // Configure Disqus with WordPress-compatible settings
    window.disqus_config = function () {
      this.page.url = wordpressUrl;
      this.page.identifier = articleId; // Use articleId as identifier instead of slug
      this.page.title = title;
    };

    // Load Disqus script
    const script = document.createElement('script');
    script.src = 'https://azfanpage.disqus.com/embed.js';
    script.setAttribute('data-timestamp', String(+new Date()));
    
    script.onload = () => {
      console.log('Disqus script loaded successfully');
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Disqus script:', error);
      setError('Failed to load comments');
      setIsLoading(false);
    };

    document.head.appendChild(script);
  };

  const resetDisqus = () => {
    setIsLoaded(false);
    setIsLoading(false);
    setError(null);
    
    // Clear the thread container
    const threadContainer = document.getElementById('disqus_thread');
    if (threadContainer) {
      threadContainer.innerHTML = '';
    }
  };

  return (
    <div ref={containerRef} className="mt-8 pt-6 border-t border-premium-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        <h3 className="headline-premium text-headline-sm mb-4 text-az-black dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-az-red" />
          Reacties
        </h3>
        
        {!isLoaded && !isLoading && !error && (
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

        {error && (
          <div className="text-center py-8">
            <p className="body-premium text-body-md text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
            <Button
              onClick={resetDisqus}
              variant="outline"
              className="px-6 py-3 border-az-red text-az-red hover:bg-az-red hover:text-white transition-all duration-200"
            >
              Opnieuw proberen
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-az-red mx-auto mb-4" />
            <p className="body-premium text-body-sm text-premium-gray-600 dark:text-gray-300">
              Reacties worden geladen...
            </p>
            {/* Show the thread container during loading so it exists when Disqus tries to use it */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-100 dark:border-gray-700 overflow-hidden mt-4">
              <div id="disqus_thread" className="p-4 min-h-[100px]"></div>
            </div>
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
    DISQUS?: {
      reset: (options: { reload: boolean; config: () => void }) => void;
    };
  }
}
