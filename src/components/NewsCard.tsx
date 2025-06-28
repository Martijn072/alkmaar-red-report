
import { User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const handleReadMore = () => {
    navigate(`/artikel/${article.id}`);
  };

  const handleTitleClick = () => {
    navigate(`/artikel/${article.id}`);
  };

  return (
    <article className="card-premium overflow-hidden animate-slide-up">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={handleTitleClick}>
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        {article.isBreaking && (
          <div className="absolute top-4 left-4">
            <span className="breaking-news">🔥 Breaking</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-premium-gray-700">
          {article.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 
          className="headline-premium text-headline-md mb-3 hover:text-az-red transition-colors cursor-pointer"
          onClick={handleTitleClick}
        >
          {article.title}
        </h2>
        
        <p className="body-premium text-body-md text-premium-gray-600 mb-4 line-clamp-2">
          {article.excerpt}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-premium-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <span>{article.publishedAt}</span>
          </div>
        </div>
      </div>
      
      {/* Interaction strip */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between pt-4 border-t border-premium-gray-100">
          <button 
            onClick={handleReadMore}
            className="flex items-center gap-2 bg-az-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-105 group"
          >
            <span className="text-sm">Lees meer</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          
          <div className="flex items-center gap-4 text-premium-gray-500">
            <button className="hover:text-az-red transition-colors">
              💬 12
            </button>
            <button className="hover:text-az-red transition-colors">
              🔗 Delen
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
