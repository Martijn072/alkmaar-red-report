import { NewsCard } from "@/components/NewsCard";
import { NextMatchWidget } from "@/components/NextMatchWidget";
import { SocialMediaPromo } from "@/components/SocialMediaPromo";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { LoadMoreSkeleton } from "@/components/LoadMoreSkeleton";
import { Button } from "@/components/ui/button";
import { H2 } from "@/components/ui/typography";
import { useState, useEffect } from "react";
import { articleCache } from "@/services/articleCache";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { 
    data,
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch
  } = useInfiniteArticles();

  const { isSyncing, handleManualSync, isOnline } = useOfflineSync();

  // Pull to refresh with sync
  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
      // Cache the new articles
      const articles = data?.pages.flatMap(page => page.articles) || [];
      if (articles.length > 0) {
        await articleCache.cacheArticles(articles);
      }
    }
  });

  // Extract all articles from all pages
  const articles = data?.pages.flatMap(page => page.articles) || [];

  // Cache articles when they load
  useEffect(() => {
    if (articles.length > 0 && isOnline) {
      articleCache.cacheArticles(articles);
    }
  }, [articles, isOnline]);

  if (error) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <OfflineIndicator 
          onSyncNow={handleManualSync}
          issyncing={isSyncing}
        />
        <Header />
        <main className="pb-20">
          <div className="container mx-auto px-s py-m">
            <div className="text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-red-600 mb-s">
                Fout bij het laden van artikelen
              </h2>
              <p className="text-premium-gray-600 dark:text-gray-400">
                {error.message}
              </p>
              {!isOnline && (
                <p className="text-sm text-premium-gray-500 dark:text-gray-400 mt-xs">
                  Controleer je internetverbinding of bekijk offline opgeslagen artikelen
                </p>
              )}
            </div>
          </div>
        </main>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <OfflineIndicator 
        onSyncNow={handleManualSync}
        issyncing={isSyncing}
      />
      
      <PullToRefreshIndicator 
        isRefreshing={isRefreshing} 
        pullDistance={pullDistance} 
        threshold={100}
      />
      
      <Header />
      
      <main className="pb-20">
        <div className="container mx-auto px-s py-m md:py-l">
          {/* Next Match Card */}
          <div className="animate-fade-in mb-m">
            <NextMatchWidget />
          </div>
          
          {/* News Section */}
          <section className="mb-xl">
            <div className="flex items-center justify-between mb-m">
              <H2 className="text-az-black dark:text-white animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Laatste Nieuws
              </H2>
              <Link 
                to="/nieuws" 
                className="inline-flex items-center text-sm text-az-red hover:text-az-red/80 transition-colors"
              >
                Alle nieuws
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-m">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-premium-gray-200 dark:bg-gray-700 rounded-lg aspect-video mb-s"></div>
                    <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded mb-xs"></div>
                    <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-m mb-m">
                  {articles.map((article, index) => (
                    <div 
                      key={article.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
                    >
                      <NewsCard article={article} />
                    </div>
                  ))}
                </div>
                
                {hasNextPage && (
                  <div className="text-center animate-fade-in">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage || (!isOnline && !articles.length)}
                      className="bg-az-red hover:bg-red-700 text-white px-l py-3 text-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isFetchingNextPage ? 'Laden...' : 'Meer artikelen laden'}
                    </Button>
                    {!isOnline && (
                      <p className="text-sm text-premium-gray-500 dark:text-gray-400 mt-xs">
                        Internetverbinding vereist voor meer artikelen
                      </p>
                    )}
                  </div>
                )}
                
                {isFetchingNextPage && <LoadMoreSkeleton />}
              </>
            )}
          </section>
          
          {/* Social Media Promo */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <SocialMediaPromo />
          </div>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
