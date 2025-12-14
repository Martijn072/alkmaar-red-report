import { useState, useEffect, useMemo } from "react";
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from "react-router-dom";
import { Download, Wifi } from "lucide-react";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { WordPressComments } from "@/components/WordPressComments";
import { ShareBar } from "@/components/ShareBar";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";
import { articleCache } from "@/services/articleCache";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error, refetch } = useArticleDetail(id!);
  const [activeTab, setActiveTab] = useState("news");
  const [cachedArticle, setCachedArticle] = useState(null);
  
  const { isSyncing, handleManualSync, isOnline } = useOfflineSync();
  
  // Check for cached version
  useEffect(() => {
    if (id) {
      const cached = articleCache.getCachedArticle(parseInt(id));
      setCachedArticle(cached);
    }
  }, [id]);

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleBack = () => {
    navigate('/nieuws');
  };

  // Cache article when it loads
  useEffect(() => {
    if (article && isOnline) {
      articleCache.cacheArticle(article, article.content);
    }
  }, [article, isOnline]);

  // Debug: Log article content when it changes
  useEffect(() => {
    if (article) {
      console.log('Article ID:', article.id);
      console.log('Article content length:', article.content?.length);
      console.log('Article content preview:', article.content?.substring(0, 500));
      
      // Check for images in content
      const imgMatches = article.content?.match(/<img[^>]*>/g);
      console.log('Images found in content:', imgMatches?.length || 0);
      if (imgMatches) {
        imgMatches.forEach((img, index) => {
          console.log(`Image ${index + 1}:`, img);
        });
      }
    }
  }, [article]);

  // Function to clean WordPress image size variants from URLs
  const cleanImageUrls = (content: string): string => {
    if (!content) return content;
    
    console.log('🖼️ Cleaning WordPress image size variants from URLs...');
    
    let cleanedContent = content;
    const originalContent = content;
    
    // Replace WordPress size variants (-900x600, -300x200, etc.) with original URLs
    cleanedContent = cleanedContent.replace(
      /(<img[^>]*src=["'])([^"']*)-\d+x\d+(\.[^"']*["'])/gi,
      (match, prefix, baseUrl, suffix) => {
        console.log(`🔧 Replacing size variant URL: ${baseUrl}-XXXxXXX${suffix} → ${baseUrl}${suffix}`);
        return prefix + baseUrl + suffix;
      }
    );
    
    // Also check for data-orig-file attributes and use those if available
    cleanedContent = cleanedContent.replace(
      /<img([^>]*data-orig-file=["'])([^"']*)["']([^>]*src=["'])[^"']*["']([^>]*)/gi,
      (match, prefix, origUrl, srcPrefix, suffix) => {
        console.log(`🔧 Using data-orig-file URL: ${origUrl}`);
        return `<img${prefix}${origUrl}"${srcPrefix}${origUrl}"${suffix}`;
      }
    );
    
    if (cleanedContent !== originalContent) {
      console.log('✅ Cleaned WordPress image size variants from URLs');
      const beforeUrls = originalContent.match(/src=["'][^"']*["']/gi) || [];
      const afterUrls = cleanedContent.match(/src=["'][^"']*["']/gi) || [];
      console.log('URLs before:', beforeUrls.slice(0, 3));
      console.log('URLs after:', afterUrls.slice(0, 3));
    }
    
    return cleanedContent;
  };

  // Function to clean WordPress caption containers
  const cleanWordPressContainers = (content: string): string => {
    if (!content) return content;
    
    console.log('🧹 Cleaning WordPress caption containers...');
    
    let cleanedContent = content;
    const originalContent = content;
    
    // Remove wp-caption wrapper divs but keep the image and caption
    cleanedContent = cleanedContent.replace(
      /<div[^>]*class="[^"]*wp-caption[^"]*"[^>]*>(.*?)<\/div>/gis,
      (match, innerContent) => {
        console.log('🔧 Removing wp-caption container:', match.substring(0, 100) + '...');
        
        // Extract image and caption separately
        const imageMatch = innerContent.match(/<img[^>]*>/i);
        const captionMatch = innerContent.match(/<p[^>]*class="[^"]*wp-caption-text[^"]*"[^>]*>(.*?)<\/p>/i);
        
        let result = imageMatch ? imageMatch[0] : '';
        if (captionMatch) {
          result += `<p class="image-caption">${captionMatch[1]}</p>`;
        }
        return result;
      }
    );
    
    // Remove attachment wrapper divs
    cleanedContent = cleanedContent.replace(
      /<div[^>]*id="attachment_\d+"[^>]*>(.*?)<\/div>/gis,
      (match, innerContent) => {
        console.log('🔧 Removing attachment container:', match.substring(0, 100) + '...');
        return innerContent;
      }
    );
    
    if (cleanedContent !== originalContent) {
      console.log('✅ Cleaned WordPress caption containers');
    }
    
    return cleanedContent;
  };

  // Function to clean image attributes that cause cropping
  const cleanImageAttributes = (content: string): string => {
    if (!content) return content;
    
    console.log('🧹 Cleaning image attributes from content...');
    
    // Remove width and height attributes from img tags
    let cleanedContent = content
      .replace(/<img([^>]*)\s+width\s*=\s*["'][^"']*["']([^>]*)/gi, '<img$1$2')
      .replace(/<img([^>]*)\s+height\s*=\s*["'][^"']*["']([^>]*)/gi, '<img$1$2');
    
    // Log if any changes were made
    if (cleanedContent !== content) {
      console.log('✅ Removed inline width/height attributes from images');
      const beforeImages = content.match(/<img[^>]*>/g) || [];
      const afterImages = cleanedContent.match(/<img[^>]*>/g) || [];
      console.log('Before cleaning:', beforeImages.length, 'images');
      console.log('After cleaning:', afterImages.length, 'images');
      beforeImages.slice(0, 3).forEach((img, i) => console.log(`Before ${i+1}:`, img));
      afterImages.slice(0, 3).forEach((img, i) => console.log(`After ${i+1}:`, img));
    }
    
    return cleanedContent;
  };

  // Function to convert internal azfanpage.nl links to app routes
  const convertInternalLinks = (content: string): string => {
    if (!content) return content;
    
    // Regex to match azfanpage.nl article links
    const linkRegex = /<a[^>]*href=["']https:\/\/www\.azfanpage\.nl\/[^"']*\/[^"']*\/?["'][^>]*>([^<]*)<\/a>/gi;
    
    return content.replace(linkRegex, (match, linkText) => {
      // Extract the href
      const hrefMatch = match.match(/href=["'](https:\/\/www\.azfanpage\.nl\/[^"']*)\/?["']/i);
      if (!hrefMatch) return match;
      
      const originalUrl = hrefMatch[1];
      console.log('🔗 Found internal link:', originalUrl);
      
      // Try to extract article ID from various URL patterns
      let articleIdentifier = null;
      
      // Pattern 1: URL with article ID at the end
      const idPattern1 = /\/(\d+)\/?$/;
      const idMatch1 = originalUrl.match(idPattern1);
      if (idMatch1) {
        articleIdentifier = idMatch1[1];
      } else {
        // Pattern 2: Look for article ID in the URL path segments
        const urlParts = originalUrl.split('/');
        for (const part of urlParts) {
          if (/^\d+$/.test(part) && parseInt(part) > 1000) { // Assuming article IDs are > 1000
            articleIdentifier = part;
            break;
          }
        }
      }
      
      // Pattern 3: Extract slug from URL (last segment before trailing slash)
      if (!articleIdentifier) {
        const slugMatch = originalUrl.match(/\/([^\/]+)\/?$/);
        if (slugMatch && slugMatch[1] && slugMatch[1] !== 'www.azfanpage.nl') {
          articleIdentifier = slugMatch[1];
          console.log('📝 Extracted slug:', articleIdentifier);
        }
      }
      
      if (articleIdentifier) {
        console.log('✅ Converting internal link to app route:', `/artikel/${articleIdentifier}`);
        // Replace with internal app link with data attribute for navigation
        return `<a href="#" data-internal-link="/artikel/${articleIdentifier}" data-original-url="${originalUrl}" class="internal-link text-az-red hover:text-red-700 underline">${linkText}</a>`;
      }
      
      console.log('❌ Could not extract article identifier from:', originalUrl);
      return match; // Return original if we can't parse the identifier
    });
  };

  // Use cached content if offline and no online data
  const displayArticle = article || (cachedArticle && !isOnline ? cachedArticle : null);
  const isShowingCachedContent = !article && cachedArticle && !isOnline;

  // Process article content to clean images and convert internal links
  const processedContent = displayArticle?.content 
    ? convertInternalLinks(cleanImageAttributes(cleanImageUrls(cleanWordPressContainers(displayArticle.content))))
    : displayArticle?.excerpt || '';

  // Sanitize content to prevent XSS attacks
  const sanitizedContent = useMemo(() => DOMPurify.sanitize(processedContent), [processedContent]);

  // DOM cleanup for any remaining image attributes after rendering
  useEffect(() => {
    if (!displayArticle) return;

    const cleanDOMImages = () => {
      const articleContent = document.querySelector('.article-content');
      if (!articleContent) return;

      const images = articleContent.querySelectorAll('img');
      console.log('🧹 Cleaning DOM images, found:', images.length);
      
      images.forEach((img, index) => {
        const hadWidth = img.hasAttribute('width');
        const hadHeight = img.hasAttribute('height');
        
        if (hadWidth || hadHeight) {
          console.log(`🔧 Cleaning image ${index + 1}:`, {
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            src: img.src.substring(0, 50) + '...'
          });
          
          img.removeAttribute('width');
          img.removeAttribute('height');
          
          console.log(`✅ Cleaned image ${index + 1}, now has natural scaling`);
        }
      });
    };

    // Run cleanup after a small delay to ensure DOM is updated
    const timeoutId = setTimeout(cleanDOMImages, 200);
    
    return () => clearTimeout(timeoutId);
  }, [displayArticle, processedContent]);

  // Setup click handlers for internal links after content is rendered
  useEffect(() => {
    if (!displayArticle) return;

    const setupInternalLinks = () => {
      const articleContent = document.querySelector('.article-content');
      if (!articleContent) return;

      const internalLinks = articleContent.querySelectorAll('a[data-internal-link]');
      
      console.log(`🔧 Setting up ${internalLinks.length} internal links`);
      
      internalLinks.forEach((link) => {
        const handleClick = (e: Event) => {
          e.preventDefault();
          const target = e.currentTarget as HTMLAnchorElement;
          const internalRoute = target.getAttribute('data-internal-link');
          const originalUrl = target.getAttribute('data-original-url');
          
          if (internalRoute) {
            console.log('🚀 Navigating to internal route:', internalRoute, 'from:', originalUrl);
            navigate(internalRoute);
          }
        };

        // Remove existing listener to avoid duplicates
        link.removeEventListener('click', handleClick);
        // Add new listener
        link.addEventListener('click', handleClick);
      });
    };

    // Run setup after a small delay to ensure DOM is updated
    const timeoutId = setTimeout(setupInternalLinks, 100);
    
    return () => {
      clearTimeout(timeoutId);
      // Cleanup: remove event listeners
      const articleContent = document.querySelector('.article-content');
      if (articleContent) {
        const internalLinks = articleContent.querySelectorAll('a[data-internal-link]');
        internalLinks.forEach((link) => {
          // Clone node to remove all event listeners
          const newLink = link.cloneNode(true);
          link.parentNode?.replaceChild(newLink, link);
        });
      }
    };
  }, [displayArticle, processedContent, navigate]);

  // Handle clicks on internal links (fallback)
  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[data-internal-link]') as HTMLAnchorElement;
    
    if (link) {
      e.preventDefault();
      const internalRoute = link.getAttribute('data-internal-link');
      if (internalRoute) {
        console.log('🚀 Fallback navigation to internal route:', internalRoute);
        navigate(internalRoute);
      }
    }
  };

  // Show loading state when we're loading and don't have cached content
  if (isLoading && !cachedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <OfflineIndicator 
          onSyncNow={handleManualSync}
          issyncing={isSyncing}
        />
        <Header />
        <div className="px-4 py-6">
          <ArticlesSkeleton />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Show error state only when we have an error and no cached content available
  if (error && !cachedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <OfflineIndicator 
          onSyncNow={handleManualSync}
          issyncing={isSyncing}
        />
        <Header />
        <div className="px-4 py-6">
          <ErrorMessage onRetry={() => refetch()} />
          {!isOnline && (
            <div className="text-center mt-4">
              <p className="text-sm text-premium-gray-500 dark:text-gray-400">
                Dit artikel is niet offline beschikbaar. Controleer je internetverbinding.
              </p>
            </div>
          )}
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Show "not found" only when we're NOT loading and have no data and no cached content
  if (!isLoading && !displayArticle) {
    return (
      <div className="min-h-screen bg-background">
        <OfflineIndicator 
          onSyncNow={handleManualSync}
          issyncing={isSyncing}
        />
        <Header />
        <div className="px-4 py-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-premium-gray-600 dark:text-gray-300 mb-2">
              Artikel niet gevonden
            </h2>
            <p className="text-premium-gray-500 dark:text-gray-400 mb-4">
              Dit artikel is niet beschikbaar {!isOnline ? 'offline' : ''}.
            </p>
            <button
              onClick={handleBack}
              className="text-az-red hover:text-red-700 font-medium underline"
            >
              Terug naar nieuws
            </button>
          </div>
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Show loading skeleton while we're still loading (even if we have cached content)
  if (isLoading && cachedArticle) {
    return (
      <div className="min-h-screen bg-background">
        <OfflineIndicator 
          onSyncNow={handleManualSync}
          issyncing={isSyncing}
        />
        <Header />
        <div className="px-4 py-6">
          <ArticlesSkeleton />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator 
        onSyncNow={handleManualSync}
        issyncing={isSyncing}
      />
      
      <Header />
      
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-20 focus:left-4 bg-az-red text-white px-4 py-2 rounded z-50"
      >
        Ga naar hoofdinhoud
      </a>
      
      {/* Sticky Share Bar - positioned below Header with correct offset */}
      <ShareBar 
        article={displayArticle}
        showBackButton={true}
        onBack={handleBack}
        className="sticky top-[72px] z-45"
      />

      {/* Article content */}
      <main id="main-content">
        <article className="max-w-4xl mx-auto px-4 py-6 pb-24" role="article" aria-labelledby="article-title">
        {/* Offline content indicator */}
        {isShowingCachedContent && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
              <Download className="w-4 h-4" />
              <span>Dit artikel wordt offline getoond. Verbind met internet voor de nieuwste versie.</span>
            </div>
          </div>
        )}

        {/* Featured image - z-0 ensures it slides under sticky header */}
        {displayArticle.imageUrl && (
          <div className="relative z-0 aspect-[16/9] overflow-hidden rounded-lg mb-6">
            <img 
              src={displayArticle.imageUrl} 
              alt={displayArticle.title}
              className="w-full h-full object-cover"
            />
            {displayArticle.isBreaking && (
              <div className="absolute top-4 left-4">
                <span className="breaking-news">🔥 Breaking</span>
              </div>
            )}
          </div>
        )}

        {/* Article header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-az-red text-white px-3 py-1 rounded-full text-sm font-medium">
              {displayArticle.category}
            </span>
            {isShowingCachedContent && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Download className="w-3 h-3" />
                Offline
              </span>
            )}
          </div>

          <h1 id="article-title" className="headline-premium text-headline-xl text-az-black dark:text-white mb-4">
            {displayArticle.title}
          </h1>

          {/* Meta info - Compact layout with author and date only */}
          <div className="text-premium-gray-600 dark:text-gray-300 text-sm border-b border-premium-gray-200 dark:border-gray-700 pb-4">
            <span>{displayArticle.author} • {displayArticle.publishedAt}</span>
          </div>
        </header>

        {/* Article content with enhanced styling and debug info */}
        <div 
          className={`article-content ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'prose-invert' : ''}`}
          onLoad={() => {
            console.log('Article content loaded, checking images...');
            const images = document.querySelectorAll('.article-content img');
            console.log('Found images in DOM:', images.length);
            images.forEach((img, index) => {
              const imageElement = img as HTMLImageElement;
              console.log(`Image ${index + 1} dimensions:`, {
                width: imageElement.clientWidth,
                height: imageElement.clientHeight,
                naturalWidth: imageElement.naturalWidth,
                naturalHeight: imageElement.naturalHeight,
                src: imageElement.src
              });
            });
          }}
        >
        <div 
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>

        {/* Comments only show for online content */}
        {!isShowingCachedContent && (
          <WordPressComments
            articleId={id!}
            articleTitle={displayArticle.title}
          />
        )}

        {isShowingCachedContent && (
          <div className="mt-8 p-4 bg-premium-gray-100 dark:bg-gray-800 rounded-lg text-center">
            <Wifi className="w-6 h-6 mx-auto mb-2 text-premium-gray-400" />
            <p className="text-sm text-premium-gray-600 dark:text-gray-300">
              Reacties zijn niet beschikbaar in offline modus
            </p>
          </div>
        )}
        </article>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ArticleDetail;
