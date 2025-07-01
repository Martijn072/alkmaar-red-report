
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Wifi } from "lucide-react";
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

  // Use cached content if offline and no online data
  const displayArticle = article || (cachedArticle && !isOnline ? cachedArticle : null);
  const isShowingCachedContent = !article && cachedArticle && !isOnline;

  if (isLoading && !cachedArticle) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
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

  if (error && !cachedArticle) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
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

  if (!displayArticle) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
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

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
      <OfflineIndicator 
        onSyncNow={handleManualSync}
        issyncing={isSyncing}
      />
      
      <Header />
      
      {/* Sticky Share Bar - positioned below Header with correct offset */}
      <ShareBar 
        article={displayArticle}
        showBackButton={true}
        onBack={handleBack}
        className="sticky top-[72px] z-45"
      />

      {/* Article content */}
      <article className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Offline content indicator */}
        {isShowingCachedContent && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
              <Download className="w-4 h-4" />
              <span>Dit artikel wordt offline getoond. Verbind met internet voor de nieuwste versie.</span>
            </div>
          </div>
        )}

        {/* Featured image */}
        {displayArticle.imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-6">
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

          <h1 className="headline-premium text-headline-xl mb-4 text-az-black dark:text-white">
            {displayArticle.title}
          </h1>

          {/* Meta info - Compact layout with author and date only */}
          <div className="text-premium-gray-600 dark:text-gray-300 text-sm border-b border-premium-gray-200 dark:border-gray-700 pb-4">
            <span>{displayArticle.author} • {displayArticle.publishedAt}</span>
          </div>
        </header>

        {/* Article content with enhanced styling */}
        <div className={`article-content ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'prose-invert' : ''}`}>
          <div 
            dangerouslySetInnerHTML={{ __html: displayArticle.content || displayArticle.excerpt }}
          />
        </div>

        {/* Comments only show for online content */}
        {!isShowingCachedContent && (
          <WordPressComments
            articleId={id!}
            title={displayArticle.title}
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

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ArticleDetail;
