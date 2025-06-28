
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { ArticlePagination } from "@/components/ArticlePagination";
import { useArticles } from "@/hooks/useArticles";

const News = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>(["Alle"]);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error, refetch } = useArticles(
    currentPage, 
    20, 
    debouncedSearch, 
    selectedCategory === 'Alle' ? '' : selectedCategory
  );

  const articles = data?.articles || [];
  const pagination = data?.pagination;

  // Update available categories when articles change
  useEffect(() => {
    if (articles.length > 0) {
      const uniqueCategories = Array.from(new Set(articles.map(article => article.category)));
      const sortedCategories = ["Alle", ...uniqueCategories.sort()];
      setAvailableCategories(sortedCategories);
    }
  }, [articles]);

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
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Header />
      
      <div className="px-4 pb-20 max-w-full">
        {/* Hero Section */}
        <div className="pt-8 pb-8">
          <div className="max-w-4xl">
            <h1 className="headline-premium text-headline-xl mb-4 text-az-black dark:text-white leading-tight">
              AZ Nieuws
            </h1>
            <p className="body-premium text-body-lg text-premium-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
              Blijf op de hoogte van het laatste nieuws over AZ Alkmaar. Van wedstrijdverslagen tot transfernieuws en behind-the-scenes verhalen.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          categories={availableCategories}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onClearFilters={handleClearFilters}
        />

        {/* Content */}
        {isLoading && <ArticlesSkeleton />}
        
        {error && <ErrorMessage onRetry={() => refetch()} />}
        
        {data && !isLoading && !error && (
          <>
            {/* News Feed */}
            <div className="space-y-6 max-w-full">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {articles.length === 0 && (
              <div className="card-premium dark:bg-gray-800 p-12 text-center max-w-full">
                <div className="max-w-md mx-auto">
                  <p className="body-premium text-body-lg text-premium-gray-600 dark:text-gray-300 mb-2">
                    {searchQuery || selectedCategory !== 'Alle' 
                      ? 'Geen artikelen gevonden voor de huidige filters.'
                      : 'Geen artikelen beschikbaar.'
                    }
                  </p>
                  {(searchQuery || selectedCategory !== 'Alle') && (
                    <p className="body-premium text-body-sm text-premium-gray-500 dark:text-gray-400">
                      Probeer andere zoektermen of wijzig de filters.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination && articles.length > 0 && (
              <ArticlePagination
                pagination={pagination}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default News;
