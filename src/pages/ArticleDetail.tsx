import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Tag, Link, Share2, MessageCircle } from "lucide-react";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { ArticlesSkeleton } from "@/components/ArticlesSkeleton";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error, refetch } = useArticleDetail(id!);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("news");

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

  const handleGenericShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-gray-50">
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
      <div className="min-h-screen bg-premium-gray-50">
        <Header />
        <div className="px-4 py-6">
          <ErrorMessage onRetry={() => refetch()} />
        </div>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-gray-50">
      <Header />
      
      {/* Back button section */}
      <div className="bg-white border-b border-premium-gray-200">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-premium-gray-600 hover:text-az-red transition-colors"
          >
            <span>← Terug naar nieuws</span>
          </button>
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

        {/* Enhanced social sharing section */}
        <div className="mt-8 pt-6 border-t border-premium-gray-200">
          <div className="text-center mb-6">
            <h3 className="headline-premium text-headline-sm mb-2 text-az-black">
              Deel dit artikel
            </h3>
            <p className="body-premium text-body-md text-premium-gray-600">
              Vond je dit artikel interessant? Deel het met anderen!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-premium-gray-200 hover:border-az-red hover:bg-az-red hover:text-white transition-all duration-200 group min-w-[160px]"
            >
              <Link className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Link kopiëren</span>
            </Button>
            
            <Button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white transition-all duration-200 hover:shadow-lg hover:scale-105 group min-w-[160px]"
            >
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">WhatsApp</span>
            </Button>
            
            <Button
              onClick={handleGenericShare}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-premium-gray-200 hover:border-az-red hover:bg-premium-gray-50 transition-all duration-200 group min-w-[160px]"
            >
              <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Delen</span>
            </Button>
          </div>
        </div>
      </article>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ArticleDetail;
