import { HeroNewsCard } from "@/components/HeroNewsCard";
import { NewsCard } from "@/components/NewsCard";
import { NextMatchWidget } from "@/components/NextMatchWidget";
import { SidebarSocialLinks } from "@/components/SidebarSocialLinks";
import { PopularArticles } from "@/components/PopularArticles";
import { ForumPostsWidget } from "@/components/ForumPostsWidget";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Button } from "@/components/ui/button";
import { H2 } from "@/components/ui/typography";
import { useState, useEffect } from "react";
import { articleCache } from "@/services/articleCache";

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

  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
      const articles = data?.pages.flatMap(page => page.articles) || [];
      if (articles.length > 0) {
        await articleCache.cacheArticles(articles);
      }
    }
  });

  const articles = data?.pages.flatMap(page => page.articles) || [];

  useEffect(() => {
    if (articles.length > 0 && isOnline) {
      articleCache.cacheArticles(articles);
    }
  }, [articles, isOnline]);

  if (error) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-200">
        <OfflineIndicator 
          onSyncNow={handleManualSync}
          issyncing={isSyncing}
        />
        <Header />
        <main className="pb-20">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-destructive mb-4">
                Fout bij het laden van artikelen
              </h2>
              <p className="text-muted-foreground">
                {error.message}
              </p>
              {!isOnline && (
                <p className="text-sm text-muted-foreground mt-2">
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
    <div className="min-h-screen bg-background transition-colors duration-200">
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
        <div className="container mx-auto px-4 py-4 lg:py-6">
          
          {/* Mobile: NextMatch First */}
          <div className="lg:hidden mb-4 animate-fade-in">
            <NextMatchWidget />
          </div>

          {/* Desktop: 2 Column Layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            
            {/* Main Content - 2/3 */}
            <div className="lg:col-span-2">
              
              {/* Loading State */}
              {isLoading ? (
                <>
                  {/* Hero Skeleton */}
                  <div className="aspect-[4/3] lg:aspect-[16/9] bg-muted rounded-xl animate-pulse mb-6" />
                  
                  {/* Grid Skeleton */}
                  <div className="mt-6">
                    <div className="h-8 w-48 bg-muted rounded mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-video bg-muted rounded-lg mb-2" />
                          <div className="h-4 bg-muted rounded mb-1 w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Hero Article */}
                  {articles.length > 0 && (
                    <div className="animate-fade-in mb-6">
                      <HeroNewsCard article={articles[0]} />
                    </div>
                  )}
                  
                  {/* Articles Grid */}
                  <section className="mt-6">
                    <H2 className="text-foreground mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      Laatste Nieuws
                    </H2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {articles.slice(1, 7).map((article, index) => (
                        <div 
                          key={article.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                        >
                          <NewsCard article={article} />
                        </div>
                      ))}
                    </div>
                    
                    {/* Load More */}
                    {hasNextPage && (
                      <div className="text-center mt-6 animate-fade-in">
                        <Button
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage || (!isOnline && !articles.length)}
                          className="bg-az-red hover:bg-az-red/90 text-white px-6 py-3 text-base"
                        >
                          {isFetchingNextPage ? 'Laden...' : 'Laad meer nieuws'}
                        </Button>
                        {!isOnline && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Internetverbinding vereist voor meer artikelen
                          </p>
                        )}
                      </div>
                    )}
                    
                    {isFetchingNextPage && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="aspect-video bg-muted rounded-lg mb-2" />
                            <div className="h-4 bg-muted rounded mb-1 w-3/4" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  
                  {/* Mobile: Social + Forum after articles */}
                  <div className="lg:hidden mt-8 space-y-4">
                    <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <SidebarSocialLinks />
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <ForumPostsWidget />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar - 1/3, Desktop Only */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <NextMatchWidget />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <SidebarSocialLinks />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <PopularArticles articles={articles.slice(1, 6)} />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <ForumPostsWidget />
                </div>
                {/* Banner Slot */}
                <div 
                  className="aspect-[300/250] bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm animate-fade-in"
                  style={{ animationDelay: '0.5s' }}
                >
                  Banner ruimte
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
