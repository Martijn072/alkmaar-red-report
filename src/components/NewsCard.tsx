import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { articleCache } from "@/services/articleCache";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { cn } from "@/lib/utils";

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
  variant?: "default" | "horizontal";
}

export const NewsCard = ({ article, variant = "default" }: NewsCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    articleCache.cacheArticle(article);
    navigate(`/artikel/${article.id}`);
  };

  if (variant === "horizontal") {
    return (
      <article 
        className="card-premium dark:bg-gray-800 dark:border-gray-700 overflow-hidden w-full group transform transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col sm:flex-row"
        onClick={handleClick}
      >
        {/* Image - Left side (40% width) */}
        <div className="relative w-full sm:w-2/5 aspect-[16/9] sm:aspect-[4/3] overflow-hidden flex-shrink-0">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content - Right side */}
        <div className="p-5 flex flex-col justify-center flex-1">
          {/* Category boven titel */}
          <span className="inline-block bg-az-red text-white px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide mb-3 w-fit">
            {article.category}
          </span>
          
          <h2 className="font-headline text-lg lg:text-xl font-bold mb-2 line-clamp-2 text-foreground group-hover:text-az-red transition-colors duration-300">
            {article.title}
          </h2>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-1 hidden sm:block">
            {article.excerpt}
          </p>

          {/* Vereenvoudigde meta */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Door {article.author}</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>
        </div>
      </article>
    );
  }

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