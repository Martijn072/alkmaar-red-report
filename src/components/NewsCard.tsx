
import { User, ArrowRight, Download, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { articleCache } from "@/services/articleCache";
import { useOfflineDetection } from "@/hooks/useOfflineDetection";

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

interface NewsCardProps {
  article: Article;
}

export const NewsCard = ({ article }: NewsCardProps) => {
  const navigate = useNavigate();
  const { isOnline } = useOfflineDetection();
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    setIsCached(articleCache.isArticleCached(article.id));
  }, [article.id]);

  const handleReadMore = () => {
    // Cache article when user wants to read it
    articleCache.cacheArticle(article);
    navigate(`/artikel/${article.id}`);
  };

  const handleTitleClick = () => {
    // Cache article when user clicks title
    articleCache.cacheArticle(article);
    navigate(`/artikel/${article.id}`);
  };

  const handleSaveOffline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await articleCache.cacheArticle(article);
    setIsCached(true);
  };

  return (
    <article className="card-premium dark:bg-gray-800 dark:border-gray-700 overflow-hidden animate-slide-up w-full max-w-full group transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden cursor-pointer w-full" onClick={handleTitleClick}>
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {article.isBreaking && (
          <div className="absolute top-4 left-4 animate-pulse">
            <span className="breaking-news shadow-lg">🔥 Breaking</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-az-red/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg hover:bg-az-red/90 hover:scale-105 transition-all duration-200 cursor-pointer">
          {article.category}
        </div>
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 w-full max-w-full">
        <h2 
          className="headline-premium text-headline-md mb-3 hover:text-az-red transition-colors duration-300 cursor-pointer break-words text-az-black dark:text-white group-hover:text-az-red"
          onClick={handleTitleClick}
        >
          {article.title}
        </h2>
        
        <p className="body-premium text-body-md text-premium-gray-600 dark:text-gray-300 mb-4 line-clamp-2 break-words">
          {article.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-premium-gray-500 dark:text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{article.author}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isOnline && !isCached && (
              <div title="Vereist internetverbinding">
                <Wifi className="w-4 h-4 text-red-500" />
              </div>
            )}
            <span className="whitespace-nowrap">{article.publishedAt}</span>
          </div>
        </div>
      </div>
      
      {/* Interaction strip */}
      <div className="px-6 pb-4 w-full max-w-full">
        <div className="flex items-center justify-between pt-4 border-t border-premium-gray-100 dark:border-gray-700">
          <button 
            onClick={handleReadMore}
            disabled={!isOnline && !isCached}
            className="flex items-center gap-2 bg-az-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 group/btn transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm whitespace-nowrap">Lees meer</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200 flex-shrink-0" />
          </button>

          {!isCached && isOnline && (
            <button
              onClick={handleSaveOffline}
              className="flex items-center gap-1 px-3 py-2 text-sm text-premium-gray-600 dark:text-gray-300 hover:text-az-red transition-colors"
              title="Opslaan voor offline"
            >
              <Download className="w-4 h-4" />
              <span>Offline</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
