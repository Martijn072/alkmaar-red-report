import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroNewsCard } from "@/components/HeroNewsCard";
import { NewsCard } from "@/components/NewsCard";
import { NextMatchWidget } from "@/components/NextMatchWidget";
import { SidebarStandings } from "@/components/SidebarStandings";
import { SidebarSocialLinks } from "@/components/SidebarSocialLinks";
import { PopularArticles } from "@/components/PopularArticles";
import { ForumPostsWidget } from "@/components/ForumPostsWidget";
import { SidebarBanner } from "@/components/SidebarBanner";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Button } from "@/components/ui/button";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { articleCache } from "@/services/articleCache";

// Fixed categories in the specified order
const FIXED_CATEGORIES = [
  "Alle",
  "Elftal en Technische staf",
  "Wedstrijden", 
  "Transfergeruchten",
  "Europees Voetbal",
  "AZ Jeugd",
  "Fotoreportages",
  "Columns",
  "Memory Lane",
  "Overig nieuws"
];

const News = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const { isSyncing, handleManualSync, isOnline } = useOfflineSync();
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { 
    data,
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch
  } = useInfiniteArticles(
    8, 
    debouncedSearch, 
    selectedCategory === 'Alle' ? '' : selectedCategory
  );

  // Pull to refresh with caching
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

  // Cache articles when they load
  useEffect(() => {
    if (articles.length > 0 && isOnline) {
      articleCache.cacheArticles(articles);
    }
  }, [articles, isOnline]);

  // Show offline content when offline and no online data
  const cachedArticles = articleCache.getCachedArticles();
  const shouldShowOfflineContent = !isOnline && cachedArticles.length > 0 && articles.length === 0;
  const displayArticles = shouldShowOfflineContent ? cachedArticles : articles;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Alle");
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "Alle";

  if (error && !shouldShowOfflineContent) {
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
              {cachedArticles.length > 0 && (
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-az-red hover:bg-az-red/90"
                >
                  Bekijk offline artikelen ({cachedArticles.length})
                </Button>
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
          
          {/* Page Title */}
          <div className="mb-6 animate-fade-in">
            <h1 className="headline-premium text-headline-xl text-foreground leading-tight">
              AZ Nieuws
            </h1>
            {shouldShowOfflineContent && (
              <p className="text-sm text-muted-foreground mt-1">
                📱 Offline beschikbare artikelen ({cachedArticles.length})
              </p>
            )}
          </div>

          {/* Mobile: NextMatch First */}
          <div className="lg:hidden mb-4 animate-fade-in">
            <NextMatchWidget />
          </div>

          {/* Desktop: 2 Column Layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-6">
            
            {/* Main Content - 2/3 */}
            <div className="lg:col-span-2">
              
              {/* Search and Filter */}
              <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <SearchAndFilter
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  categories={FIXED_CATEGORIES}
                  onSearchChange={handleSearchChange}
                  onCategoryChange={handleCategoryChange}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Loading State */}
              {isLoading ? (
                <>
                  {/* Hero Skeleton */}
                  <div className="aspect-[4/3] lg:aspect-[16/9] bg-muted rounded-xl animate-pulse mb-6" />
                  
                  {/* 2x2 Grid Skeleton */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-video bg-muted rounded-lg mb-2" />
                        <div className="h-4 bg-muted rounded mb-1 w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </>
              ) : displayArticles.length === 0 ? (
                <div className="card-premium p-12 text-center animate-fade-in">
                  <div className="max-w-md mx-auto">
                    <p className="body-premium text-body-lg text-muted-foreground mb-2">
                      {hasActiveFilters 
                        ? 'Geen artikelen gevonden voor de huidige filters.'
                        : !isOnline 
                          ? 'Geen offline opgeslagen artikelen beschikbaar.'
                          : 'Geen artikelen beschikbaar.'
                      }
                    </p>
                    {hasActiveFilters && (
                      <Button
                        onClick={handleClearFilters}
                        variant="outline"
                        className="mt-4"
                      >
                        Filters wissen
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Repeating Pattern: Hero → 4 Grid → Hero → 2 Grid (per 8 articles) */}
                  {Array.from({ length: Math.ceil(displayArticles.length / 8) }).map((_, blockIndex) => {
                    const startIndex = blockIndex * 8;
                    const blockArticles = displayArticles.slice(startIndex, startIndex + 8);
                    
                    return (
                      <div key={blockIndex} className={blockIndex > 0 ? "mt-6" : ""}>
                        {/* Hero Article */}
                        {blockArticles[0] && (
                          <div className="animate-fade-in">
                            <HeroNewsCard article={blockArticles[0]} />
                          </div>
                        )}
                        
                        {/* 2x2 Grid - 4 articles */}
                        {blockArticles.length > 1 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            {blockArticles.slice(1, 5).map((article, index) => (
                              <div 
                                key={article.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                              >
                                <NewsCard article={article} />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Secondary Hero */}
                        {blockArticles[5] && (
                          <div className="animate-fade-in mt-6" style={{ animationDelay: '0.2s' }}>
                            <HeroNewsCard article={blockArticles[5]} />
                          </div>
                        )}
                        
                        {/* 2 Column Grid - 2 articles */}
                        {blockArticles.length > 6 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            {blockArticles.slice(6, 8).map((article, index) => (
                              <div 
                                key={article.id}
                                className="animate-fade-in"
                                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                              >
                                <NewsCard article={article} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Load More */}
                  {hasNextPage && !shouldShowOfflineContent && (
                    <div className="text-center mt-8 animate-fade-in">
                      <Button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage || !isOnline}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-video bg-muted rounded-lg mb-2" />
                          <div className="h-4 bg-muted rounded mb-1 w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Mobile: Social + Forum after articles */}
                  <div className="lg:hidden mt-8 space-y-4">
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <SidebarSocialLinks />
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <ForumPostsWidget />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar - 1/3, Desktop Only */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                {/* Group 1: Primary - no delay */}
                <NextMatchWidget />
                <SidebarBanner slot="sidebar-1" />
                
                {/* Group 2: Secondary - 0.1s */}
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <SidebarStandings />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <SidebarBanner slot="sidebar-2" />
                </div>
                
                {/* Group 3: Tertiary - 0.2s */}
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <PopularArticles articles={displayArticles.slice(1, 6)} />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <ForumPostsWidget />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <SidebarBanner slot="sidebar-3" />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <SidebarSocialLinks />
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

export default News;
