
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Tag } from "lucide-react";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error, refetch } = useArticleDetail(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-gray-50">
        <div className="px-4 py-6">
          <ArticlesSkeleton />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-premium-gray-50">
        <div className="px-4 py-6">
          <ErrorMessage onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-premium-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-premium-gray-600 hover:text-az-red transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Terug</span>
          </button>
        </div>
      </div>

      {/* Article content */}
      <article className="max-w-4xl mx-auto px-4 py-6">
        {/* Featured image */}
        {article.imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-6">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
            {article.isBreaking && (
              <div className="absolute top-4 left-4">
                <span className="breaking-news">🔥 Breaking</span>
              </div>
            )}
          </div>
        )}

        {/* Article header */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-az-red text-white px-3 py-1 rounded-full text-sm font-medium">
              {article.category}
            </span>
          </div>

          <h1 className="headline-premium text-headline-xl mb-4">
            {article.title}
          </h1>

          {/* Meta info */}
          <div className="flex items-center gap-6 text-premium-gray-600 text-sm border-b border-premium-gray-200 pb-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{article.publishedAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Article content with enhanced styling */}
        <div className="article-content">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Social sharing */}
        <div className="mt-8 pt-6 border-t border-premium-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-premium-gray-600 font-medium">Delen:</span>
            <button className="flex items-center gap-2 text-premium-gray-600 hover:text-az-red transition-colors">
              🔗 Link kopiëren
            </button>
            <button className="flex items-center gap-2 text-premium-gray-600 hover:text-az-red transition-colors">
              📱 WhatsApp
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;
