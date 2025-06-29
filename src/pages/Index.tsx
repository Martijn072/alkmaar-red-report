
import { useState } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LiveScore } from "@/components/LiveScore";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { LoadMoreSkeleton } from "@/components/LoadMoreSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SocialMediaPromo } from "@/components/SocialMediaPromo";
import { PopularArticles } from "@/components/PopularArticles";
import { useInfiniteArticles } from "@/hooks/useInfiniteArticles";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [selectedCategory, setSelectedCategory] = useState("Alles");
  
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch 
  } = useInfiniteArticles(8, '', selectedCategory === 'Alles' ? '' : selectedCategory);

  const categories = ["Alles", "Wedstrijdverslag", "Transfer", "Jeugd", "Interviews", "Nieuws"];

  // Flatten all articles from all pages
  const allArticles = data?.pages.flatMap(page => page.articles) || [];
  const breakingNews = allArticles.filter(article => article.isBreaking);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Live Score Widget */}
      <LiveScore />
      
      <div className="px-4 pb-20 pt-6">
        {/* Category Filter */}
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Breaking News Badge */}
        {breakingNews.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="breaking-news">🔥 Breaking</span>
              <span className="text-premium-gray-600 dark:text-gray-300 text-sm">
                {breakingNews.length} {breakingNews.length === 1 ? 'nieuw artikel' : 'nieuwe artikelen'}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading && <ArticlesSkeleton />}
        
        {error && <ErrorMessage onRetry={() => refetch()} />}
        
        {data && !isLoading && !error && (
          <>
            {/* News Feed with Social Media Promo */}
            <div className="space-y-6">
              {allArticles.map((article, index) => (
                <div key={article.id}>
                  <NewsCard article={article} />
                  {/* Show Social Media Promo after 4th article (index 3) */}
                  {index === 3 && <SocialMediaPromo />}
                </div>
              ))}
            </div>

            {/* Loading skeleton for "Load More" */}
            {isFetchingNextPage && <LoadMoreSkeleton />}

            {allArticles.length === 0 && !isFetchingNextPage && (
              <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-8 text-center">
                <p className="body-premium text-premium-gray-600 dark:text-gray-300">
                  Geen artikelen gevonden voor de categorie "{selectedCategory}".
                </p>
              </div>
            )}

            {/* Popular Articles Section */}
            {allArticles.length > 0 && <PopularArticles />}

            {/* Load More Button */}
            {hasNextPage && allArticles.length > 0 && !isFetchingNextPage && (
              <div className="mt-8 mb-8 text-center">
                <Button 
                  onClick={handleLoadMore}
                  className="bg-white hover:bg-premium-gray-50 text-az-black border border-premium-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Laad meer artikelen
                </Button>
              </div>
            )}

            {/* End of articles message */}
            {!hasNextPage && allArticles.length > 0 && !isFetchingNextPage && (
              <div className="mt-8 mb-8 text-center">
                <p className="text-premium-gray-500 dark:text-gray-400 text-sm">
                  Alle artikelen zijn geladen
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
