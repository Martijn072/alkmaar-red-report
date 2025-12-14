import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { articleCache } from "@/services/articleCache";
import { OptimizedImage } from "@/components/ui/optimized-image";

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

  const handleClick = () => {
    articleCache.cacheArticle(article);
    navigate(`/artikel/${article.id}`);
  };

  return (
    <article 
      className="card-premium dark:bg-gray-800 dark:border-gray-700 overflow-hidden w-full group transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden w-full">
        <OptimizedImage 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-700"
        />
        {article.isBreaking && (
          <div className="absolute top-2 left-2 animate-pulse">
            <span className="bg-az-red text-white px-2 py-0.5 rounded text-xs font-bold shadow-lg">
              🔥 Breaking
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-az-red/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-semibold text-white shadow-lg">
          {article.category}
        </div>
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-3">
        <h2 className="font-headline text-base font-semibold mb-2 line-clamp-2 text-foreground group-hover:text-az-red transition-colors duration-300">
          {article.title}
        </h2>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {article.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{article.author}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{article.readTime}</span>
          </div>
          <span>•</span>
          <span>{article.publishedAt}</span>
        </div>
      </div>
    </article>
  );
};
