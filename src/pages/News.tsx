
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
    <div className="min-h-screen bg-premium-gray-50">
      <Header />
      
      <div className="px-4 pb-20 pt-6">
        <div className="mb-6">
          <h1 className="headline-premium text-headline-xl mb-2 text-az-black">
            Alle Nieuws
          </h1>
          <p className="body-premium text-body-md text-premium-gray-600">
            Het laatste nieuws over AZ Alkmaar
          </p>
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
            <div className="space-y-6">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {articles.length === 0 && (
              <div className="card-premium p-8 text-center">
                <p className="body-premium text-premium-gray-600">
                  {searchQuery || selectedCategory !== 'Alle' 
                    ? 'Geen artikelen gevonden voor de huidige filters.'
                    : 'Geen artikelen gevonden.'
                  }
                </p>
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
