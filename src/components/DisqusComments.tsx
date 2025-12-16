import { useEffect, useRef, useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface DisqusCommentsProps {
  articleId: string;
  articleTitle: string;
  articleSlug?: string;
}

declare global {
  interface Window {
    DISQUS: any;
    disqus_config: any;
  }
}

export const DisqusComments = ({ articleId, articleTitle, articleSlug }: DisqusCommentsProps) => {
  const { isDarkMode } = useDarkMode();
  const disqusRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const shortname = 'azfanpage';

  // Lazy load Disqus when component becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (disqusRef.current) {
      observer.observe(disqusRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load Disqus script when visible
  useEffect(() => {
    if (!isVisible) return;

    // URL naar de hoofdwebsite (niet de PWA)
    const pageUrl = `https://www.azfanpage.nl/${articleSlug || articleId}/`;
    const pageIdentifier = articleId;

    // Configure Disqus
    window.disqus_config = function() {
      this.page.url = pageUrl;
      this.page.identifier = pageIdentifier;
      this.page.title = articleTitle;
    };

    // Check if Disqus is already loaded
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: function() {
          this.page.url = pageUrl;
          this.page.identifier = pageIdentifier;
          this.page.title = articleTitle;
        }
      });
    } else {
      // Load Disqus script
      const script = document.createElement('script');
      script.src = `https://${shortname}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', String(+new Date()));
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup: remove any Disqus-related scripts on unmount
      const disqusThread = document.getElementById('disqus_thread');
      if (disqusThread) {
        disqusThread.innerHTML = '';
      }
    };
  }, [isVisible, articleId, articleTitle, articleSlug]);

  return (
    <div ref={disqusRef} className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Reacties</h3>
      {!isVisible ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          <span>Reacties laden...</span>
        </div>
      ) : (
        <div 
          id="disqus_thread" 
          className={isDarkMode ? 'disqus-dark' : ''}
        />
      )}
    </div>
  );
};
