import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
interface DisqusCommentsProps {
  slug: string;
  title: string;
  articleId: string;
}
export const DisqusComments = ({
  slug,
  title,
  articleId
}: DisqusCommentsProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIdentifier, setCurrentIdentifier] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate WordPress URL from slug
  const getWordPressUrl = (slug: string) => {
    return `https://www.azfanpage.nl/${slug}/`;
  };

  // Generate possible identifier formats that WordPress might use
  const getPossibleIdentifiers = (articleId: string, slug: string) => {
    return [`post-${articleId}`,
    // WordPress default format
    articleId,
    // Simple ID
    `${articleId} https://www.azfanpage.nl/${slug}/`,
    // ID + URL format
    slug,
    // Slug format
    `https://www.azfanpage.nl/${slug}/` // Full URL format
    ];
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px 0px'
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Clean up function to remove Disqus completely
  const cleanupDisqus = () => {
    console.log('🧹 Cleaning up existing Disqus...');

    // Remove existing Disqus script
    const existingScript = document.querySelector('script[src*="disqus.com/embed.js"]');
    if (existingScript) {
      existingScript.remove();
      console.log('Removed existing Disqus script');
    }

    // Clear thread container
    const threadContainer = document.getElementById('disqus_thread');
    if (threadContainer) {
      threadContainer.innerHTML = '';
      console.log('Cleared Disqus thread container');
    }

    // Remove global Disqus variables
    if (window.DISQUS) {
      delete window.DISQUS;
      console.log('Removed global DISQUS object');
    }
    if (window.disqus_config) {
      delete window.disqus_config;
      console.log('Removed global disqus_config');
    }

    // Clear any Disqus iframes that might be lingering
    const disqusIframes = document.querySelectorAll('iframe[src*="disqus"]');
    disqusIframes.forEach(iframe => iframe.remove());
  };
  const loadDisqusWithIdentifier = async (identifier: string, wpUrl: string) => {
    console.log(`🔍 Testing identifier: "${identifier}" with URL: "${wpUrl}"`);

    // Clean up any existing Disqus first
    cleanupDisqus();
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check if thread container exists
    const threadContainer = document.getElementById('disqus_thread');
    if (!threadContainer) {
      console.error('❌ Disqus thread container not found');
      return false;
    }

    // Configure Disqus with WordPress URL and identifier
    window.disqus_config = function () {
      this.page.url = wpUrl;
      this.page.identifier = identifier;
      this.page.title = title;
      console.log('🔧 Disqus config set:', {
        url: this.page.url,
        identifier: this.page.identifier,
        title: this.page.title
      });
    };

    // Create and load new Disqus script
    return new Promise<boolean>(resolve => {
      const script = document.createElement('script');
      script.src = 'https://azfanpage.disqus.com/embed.js';
      script.setAttribute('data-timestamp', String(+new Date()));
      script.async = true;
      const timeout = setTimeout(() => {
        console.log(`⏰ Timeout for identifier: ${identifier}`);
        script.remove();
        resolve(false);
      }, 10000);
      script.onload = () => {
        console.log(`✅ Disqus script loaded for identifier: ${identifier}`);
        clearTimeout(timeout);
        setCurrentIdentifier(identifier);
        resolve(true);
      };
      script.onerror = error => {
        console.error(`❌ Failed to load Disqus script for identifier: ${identifier}:`, error);
        clearTimeout(timeout);
        script.remove();
        resolve(false);
      };
      document.head.appendChild(script);
    });
  };
  const loadDisqus = async () => {
    if (isLoaded || isLoading) return;
    console.log('🚀 Starting Disqus identifier mapping process...');
    console.log('📋 Article info:', {
      articleId,
      slug,
      title
    });
    setIsLoading(true);
    setError(null);
    const wordpressUrl = getWordPressUrl(slug);
    const possibleIdentifiers = getPossibleIdentifiers(articleId, slug);
    console.log('🎯 Testing identifiers:', possibleIdentifiers);
    console.log('🔗 WordPress URL:', wordpressUrl);

    // Test each identifier format
    for (const identifier of possibleIdentifiers) {
      console.log(`🧪 Testing identifier format: ${identifier}`);
      try {
        const success = await loadDisqusWithIdentifier(identifier, wordpressUrl);
        if (success) {
          console.log(`🎉 SUCCESS! Working identifier: ${identifier}`);
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error(`💥 Error testing identifier ${identifier}:`, error);
      }

      // Wait between attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // If all WordPress identifiers fail, try with current page URL as fallback
    console.log('🔄 All WordPress identifiers failed, trying fallback with current URL...');
    try {
      const fallbackSuccess = await loadDisqusWithIdentifier(articleId, window.location.href);
      if (fallbackSuccess) {
        console.log('✅ Fallback successful with current URL');
        setIsLoaded(true);
      } else {
        console.error('❌ All identifier formats failed');
        setError('Kon comments niet laden met geen enkele identifier');
      }
    } catch (error) {
      console.error('💥 Fallback also failed:', error);
      setError('Kon comments niet laden');
    }
    setIsLoading(false);
  };
  const resetDisqus = () => {
    console.log('🔄 Resetting Disqus...');
    setIsLoaded(false);
    setIsLoading(false);
    setError(null);
    setCurrentIdentifier('');
    cleanupDisqus();
  };
  return <div ref={containerRef} className="mt-8 pt-6 border-t border-premium-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto">
        <h3 className="headline-premium text-headline-sm mb-4 text-az-black dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-az-red" />
          Reacties
          {currentIdentifier && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              ID: {currentIdentifier}
            </span>}
        </h3>
        
        {!isLoaded && !isLoading && !error && <div className="text-center py-8">
            <p className="body-premium text-body-md text-premium-gray-600 dark:text-gray-300 mb-4">Deel je mening over dit artikel met je medesupporters en doe dat op respectvolle wijze.</p>
            <Button onClick={loadDisqus} className="bg-az-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto">
              <MessageCircle className="w-4 h-4" />
              Reacties laden
            </Button>
          </div>}

        {error && <div className="text-center py-8">
            <p className="body-premium text-body-md text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
            <Button onClick={resetDisqus} variant="outline" className="px-6 py-3 border-az-red text-az-red hover:bg-az-red hover:text-white transition-all duration-200">
              Opnieuw proberen
            </Button>
          </div>}

        {/* Disqus container - only show when loading or loaded */}
        {(isLoading || isLoaded) && <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-100 dark:border-gray-700 overflow-hidden">
            {isLoading && <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-az-red mx-auto mb-4" />
                <p className="body-premium text-body-sm text-premium-gray-600 dark:text-gray-300">
                  Verschillende identifier formats testen...
                </p>
              </div>}
            <div id="disqus_thread" className="p-4 min-h-[200px]"></div>
          </div>}

        {/* Debug info when loaded */}
        {isLoaded && currentIdentifier && <div className="text-center mt-4">
            <p className="text-xs text-premium-gray-400 dark:text-gray-500">
              Powered by Disqus • Werkende identifier: {currentIdentifier}
            </p>
          </div>}
      </div>
    </div>;
};

// Type declaration for Disqus global configuration
declare global {
  interface Window {
    disqus_config?: () => void;
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config: () => void;
      }) => void;
    };
  }
}