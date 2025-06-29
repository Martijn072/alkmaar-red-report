
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { DisqusComments } from "@/components/DisqusComments";
import { ShareBar } from "@/components/ShareBar";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error, refetch } = useArticleDetail(id!);
  const [activeTab, setActiveTab] = useState("news");

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleBack = () => {
    navigate('/nieuws');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
        <Header />
        <div className="px-4 py-6">
          <ArticlesSkeleton />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
        <Header />
        <div className="px-4 py-6">
          <ErrorMessage onRetry={() => refetch()} />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Sticky Share Bar - positioned below Header with correct offset */}
      <ShareBar 
        article={article}
        showBackButton={true}
        onBack={handleBack}
        className="sticky top-[72px] z-45"
      />

      {/* Article content */}
      <article className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Featured image */}
        {article.imageUrl && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg mb-6">
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

          <h1 className="headline-premium text-headline-xl mb-4 text-az-black dark:text-white">
            {article.title}
          </h1>

          {/* Meta info - Improved mobile layout */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-premium-gray-600 dark:text-gray-300 text-sm border-b border-premium-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>{article.publishedAt}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Article content with enhanced styling */}
        <div className={`article-content ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'prose-invert' : ''}`}>
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Bottom Share Bar - after article content */}
        <div className="mt-8 mb-8">
          <ShareBar 
            article={article}
            showBackButton={false}
            className="border border-premium-gray-200 dark:border-gray-700 rounded-lg"
          />
        </div>

        {/* Disqus Comments Section */}
        <DisqusComments
          slug={article.slug}
          title={article.title}
          articleId={id!}
        />
      </article>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ArticleDetail;
