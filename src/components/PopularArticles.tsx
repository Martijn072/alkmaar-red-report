import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  category: string;
  isBreaking: boolean;
  readTime: string;
}

interface PopularArticlesProps {
  articles: Article[];
}

export const PopularArticles = ({ articles }: PopularArticlesProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recent' | 'popular'>('recent');

  if (!articles || articles.length === 0) {
    return null;
  }

  // Recent = by date, Popular = prioritize breaking then by date
  const recentArticles = [...articles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  const popularArticles = [...articles]
    .sort((a, b) => {
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, 5);

  const displayArticles = activeTab === 'recent' ? recentArticles : popularArticles;

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: nl });
    } catch {
      return dateString;
    }
  };

  const handleArticleClick = (articleId: number) => {
    navigate(`/artikel/${articleId}`);
  };

  return (
    <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'recent'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'popular'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Populair
        </button>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {displayArticles.map((article, index) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article.id)}
            className={`flex gap-3 cursor-pointer group ${
              index < displayArticles.length - 1 ? 'pb-3 border-b border-border' : ''
            }`}
          >
            {/* Ranking Number */}
            <span className="text-2xl font-bold text-az-red/30 dark:text-az-red/40 w-6 flex-shrink-0">
              {index + 1}
            </span>

            {/* Thumbnail */}
            <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {article.isBreaking && (
                <div className="absolute top-0.5 left-0.5">
                  <span className="text-xs">🔥</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <span className="text-xs text-az-red font-medium mb-0.5 block">
                {article.category}
              </span>
              <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-az-red transition-colors">
                {article.title}
              </h4>
              <span className="text-xs text-muted-foreground mt-1 block">
                {formatRelativeTime(article.publishedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
