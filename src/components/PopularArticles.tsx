
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";

export const PopularArticles = () => {
  const navigate = useNavigate();
  
  // Fetch recent articles and simulate popularity based on recency and breaking status
  const { data, isLoading, error } = useArticles(1, 8);
  
  if (isLoading || error || !data) {
    return null;
  }

  // Simulate popular articles by prioritizing breaking news and recent articles
  const popularArticles = data.articles
    .sort((a, b) => {
      // Prioritize breaking news
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      
      // Then sort by date (more recent = more popular)
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, 4);

  const handleArticleClick = (articleId: number) => {
    navigate(`/artikel/${articleId}`);
  };

  return (
    <div className="my-12">
      <div className="text-center mb-6">
        <h2 className="headline-premium text-headline-lg text-az-red mb-2">
          Meest gelezen
        </h2>
        <p className="body-premium text-premium-gray-600 dark:text-gray-300 text-body-md">
          De populairste AZ artikelen van deze week
        </p>
      </div>

      {/* Desktop: 2x2 Grid, Mobile: Horizontal scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {popularArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article.id)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-premium-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
          >
            <div className="flex gap-3 p-4">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {article.isBreaking && (
                  <div className="absolute top-1 left-1">
                    <span className="bg-az-red text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                      🔥
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-az-red bg-az-red/10 px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>
                
                <h3 className="headline-premium text-sm font-semibold text-az-black dark:text-white mb-2 line-clamp-2 group-hover:text-az-red transition-colors">
                  {article.title}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-premium-gray-500 dark:text-gray-400">
                  <User className="w-3 h-3" />
                  <span className="truncate">{article.author}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all link */}
      <div className="text-center mt-6">
        <button
          onClick={() => navigate('/nieuws')}
          className="text-az-red hover:text-red-700 font-medium text-sm hover:underline transition-colors"
        >
          Bekijk alle populaire artikelen →
        </button>
      </div>
    </div>
  );
};
