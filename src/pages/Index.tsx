
import { useState } from "react";
import { Header } from "@/components/Header";
import { NewsCard } from "@/components/NewsCard";
import { BottomNavigation } from "@/components/BottomNavigation";
import { LiveScore } from "@/components/LiveScore";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useArticles } from "@/hooks/useArticles";

const Index = () => {
  const [activeTab, setActiveTab] = useState("news");
  const [selectedCategory, setSelectedCategory] = useState("Alles");
  
  const { data: articles, isLoading, error, refetch } = useArticles();

  const categories = ["Alles", "Wedstrijdverslag", "Transfer", "Jeugd", "Interviews", "Nieuws"];

  const filteredArticles = articles?.filter(article => 
    selectedCategory === "Alles" || article.category === selectedCategory
  ) || [];

  const breakingNews = articles?.filter(article => article.isBreaking) || [];

  return (
    <div className="min-h-screen bg-premium-gray-50">
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
              <span className="text-premium-gray-600 text-sm">
                {breakingNews.length} {breakingNews.length === 1 ? 'nieuw artikel' : 'nieuwe artikelen'}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading && <ArticlesSkeleton />}
        
        {error && <ErrorMessage onRetry={() => refetch()} />}
        
        {articles && !isLoading && !error && (
          <>
            {/* News Feed */}
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="card-premium p-8 text-center">
                <p className="body-premium text-premium-gray-600">
                  Geen artikelen gevonden voor de categorie "{selectedCategory}".
                </p>
              </div>
            )}

            {/* Load More */}
            {filteredArticles.length > 0 && (
              <div className="mt-8 text-center">
                <button 
                  className="btn-secondary"
                  onClick={() => refetch()}
                >
                  Ververs voor nieuw nieuws
                </button>
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
