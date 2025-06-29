import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Tag, Link, Share2, MessageCircle, Facebook, Instagram, X } from "lucide-react";
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

  const handleSocialMediaClick = (platform: string) => {
    // Replace these URLs with your actual social media URLs
    const socialUrls = {
      facebook: 'https://facebook.com/your-page',
      instagram: 'https://instagram.com/your-account',
      x: 'https://x.com/your-account'
    };
    
    window.open(socialUrls[platform as keyof typeof socialUrls], '_blank');
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
      
      {/* Back button section */}
      <div className="bg-white dark:bg-gray-800 border-b border-premium-gray-200 dark:border-gray-700">
        <div className="px-4 py-4">
          <button
            onClick={() => navigate('/nieuws')}
            className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-300 hover:text-az-red dark:hover:text-az-red transition-colors"
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

        {/* Social Media Follow Section */}
        <div className="mt-8 pt-6 border-t border-premium-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-premium-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-lg p-6 border border-premium-gray-100 dark:border-gray-700">
            <div className="text-center mb-4">
              <h3 className="headline-premium text-headline-sm mb-2 text-az-black dark:text-white">
                Volg ons op social media
              </h3>
              <p className="body-premium text-body-sm text-premium-gray-600 dark:text-gray-400">
                Blijf op de hoogte van het laatste nieuws en updates
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleSocialMediaClick('facebook')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 group"
                aria-label="Volg ons op Facebook"
              >
                <Facebook className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium text-sm">Facebook</span>
              </button>
              
              <button
                onClick={() => handleSocialMediaClick('instagram')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-200 hover:scale-105 group"
                aria-label="Volg ons op Instagram"
              >
                <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium text-sm">Instagram</span>
              </button>
              
              <button
                onClick={() => handleSocialMediaClick('x')}
                className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 hover:scale-105 group"
                aria-label="Volg ons op X"
              >
                <X className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium text-sm">X</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced social sharing section */}
        <div className="mt-6 pt-6 border-t border-premium-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h3 className="headline-premium text-headline-sm mb-2 text-az-black dark:text-white">
              Deel dit artikel
            </h3>
            <p className="body-premium text-body-md text-premium-gray-600 dark:text-gray-300">
              Vond je dit artikel interessant? Deel het met anderen!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-premium-gray-200 dark:border-gray-600 hover:border-az-red hover:bg-az-red hover:text-white transition-all duration-200 group min-w-[160px] text-gray-900 dark:text-gray-100"
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
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-premium-gray-200 dark:border-gray-600 hover:border-az-red hover:bg-premium-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group min-w-[160px] text-gray-900 dark:text-gray-100"
            >
              <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">Delen</span>
            </Button>
          </div>
        </div>

        {/* Disqus Comments Section */}
        <DisqusComments
          url={window.location.href}
          identifier={`article-${article.id}`}
          title={article.title}
        />
      </article>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ArticleDetail;
