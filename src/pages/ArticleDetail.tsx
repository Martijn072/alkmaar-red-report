import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Tag, Link, Share2, MessageCircle, Facebook, X } from "lucide-react";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { DisqusComments } from "@/components/DisqusComments";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error, refetch } = useArticleDetail(id!);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("news");

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link gekopieerd!",
        description: "De artikel link is gekopieerd naar je klembord.",
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast({
        title: "Fout",
        description: "Kon de link niet kopiëren. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `${article?.title} - ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const url = window.location.href;
    const text = `${article?.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
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
      
      {/* Sticky Share Bar - positioned below Header */}
      <div className="sticky top-28 z-45 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-premium-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/nieuws')}
              className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-300 hover:text-az-red dark:hover:text-az-red transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Terug</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-premium-gray-500 dark:text-gray-400 mr-2">Delen:</span>
              <button
                onClick={handleWhatsAppShare}
                className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                title="Delen via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleTwitterShare}
                className="p-2 rounded-full bg-black hover:bg-gray-800 text-white transition-colors"
                title="Delen via Twitter"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleFacebookShare}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                title="Delen via Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-full bg-az-red hover:bg-red-700 text-white transition-colors"
                title="Link kopiëren"
              >
                <Link className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
        <div className={`article-content ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'prose-invert' : ''}`}>
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Disqus Comments Section - Now directly after article content */}
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
