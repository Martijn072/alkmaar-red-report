import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { ArticlePagination } from "@/components/ArticlePagination";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useArticles } from "@/hooks/useArticles";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showOfflineContent, setShowOfflineContent] = useState(false);
  
  const { isSyncing, handleManualSync, isOnline } = useOfflineSync();
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error, refetch } = useArticles(
    currentPage, 
    20, 
    debouncedSearch, 
    selectedCategory === 'Alle' ? '' : selectedCategory
  );

  // Pull to refresh with caching
  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
      const articles = data?.articles || [];
      if (articles.length > 0) {
        await articleCache.cacheArticles(articles);
      }
    }
  });

  const articles = data?.articles || [];
  const pagination = data?.pagination;

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Alle");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
      
      <div className="px-4 pb-20 max-w-full">
        {/* Hero Section */}
        <div className="pt-8 pb-8 animate-fade-in">
          <div className="max-w-4xl">
            <h1 className="headline-premium text-headline-xl mb-2 text-foreground leading-tight">
              AZ Nieuws
            </h1>
            {shouldShowOfflineContent && (
              <p className="text-sm text-muted-foreground mb-4">
                📱 Offline beschikbare artikelen ({cachedArticles.length})
              </p>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <SearchAndFilter
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            categories={FIXED_CATEGORIES}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Content */}
        {isLoading && !shouldShowOfflineContent && <ArticlesSkeleton />}
        
        {error && !shouldShowOfflineContent && (
          <div className="space-y-4">
            <ErrorMessage onRetry={() => refetch()} />
            {cachedArticles.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowOfflineContent(true)}
                  className="text-az-red hover:text-red-700 font-medium underline"
                >
                  Bekijk offline opgeslagen artikelen ({cachedArticles.length})
                </button>
              </div>
            )}
          </div>
        )}
        
        {((data && !isLoading && !error) || shouldShowOfflineContent) && (
          <>
            {/* News Feed */}
            <div className="space-y-6 max-w-full">
              {displayArticles.map((article, index) => (
                <div 
                  key={article.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.2 + (index * 0.05)}s` }}
                >
                  <NewsCard article={article} />
                </div>
              ))}
            </div>

            {displayArticles.length === 0 && (
              <div className="card-premium p-12 text-center max-w-full animate-fade-in">
                <div className="max-w-md mx-auto">
                  <p className="body-premium text-body-lg text-muted-foreground mb-2">
                    {searchQuery || selectedCategory !== 'Alle' 
                      ? 'Geen artikelen gevonden voor de huidige filters.'
                      : !isOnline 
                        ? 'Geen offline opgeslagen artikelen beschikbaar.'
                        : 'Geen artikelen beschikbaar.'
                    }
                  </p>
                  {(searchQuery || selectedCategory !== 'Alle') && (
                    <p className="body-premium text-body-sm text-muted-foreground/70">
                      Probeer andere zoektermen of wijzig de filters.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pagination - only show for online content */}
            {pagination && !shouldShowOfflineContent && displayArticles.length > 0 && (
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <ArticlePagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default News;
