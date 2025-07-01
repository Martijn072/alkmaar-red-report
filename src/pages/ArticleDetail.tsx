
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ShareBar } from "@/components/ShareBar";
import { useArticleDetail } from "@/hooks/useArticleDetail";
import { useState } from "react";
import { ArrowLeft, Calendar, User, Eye, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SecureCommentsSection } from "@/components/comments/SecureCommentsSection";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();
  
  const { data: article, isLoading, error } = useArticleDetail(id ? id : '0');

  console.log('ArticleDetail rendering with new secure comment system');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pb-20">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-premium-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-64 bg-premium-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-3">
                <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-premium-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pb-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-premium-gray-900 dark:text-white mb-4">
                Artikel niet gevonden
              </h1>
              <p className="text-premium-gray-600 dark:text-gray-300 mb-8">
                Het artikel dat je zoekt bestaat niet of is verwijderd.
              </p>
              <button
                onClick={() => navigate('/nieuws')}
                className="bg-az-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Terug naar nieuws
              </button>
            </div>
          </div>
        </main>
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-premium-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pb-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-300 hover:text-az-red transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug</span>
          </button>

          {/* Article Content */}
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-premium-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Article Header */}
            <div className="p-6 border-b border-premium-gray-100 dark:border-gray-700">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-az-red text-white">
                  {article.category}
                </span>
                {article.isBreaking && (
                  <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    🔥 Breaking
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="headline-premium text-headline-xl text-az-black dark:text-white mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-premium-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(article.publishedAt).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime} min lezen</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>0 weergaven</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {article.imageUrl && (
              <div className="relative">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
              </div>
            )}

            {/* Article Body */}
            <div className="p-6">
              <div 
                className="body-premium text-body-lg text-premium-gray-700 dark:text-gray-300 leading-relaxed prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </article>

          {/* Share Bar */}
          <div className="mt-8">
            <ShareBar
              article={{
                title: article.title,
                slug: article.slug || id || ''
              }}
            />
          </div>

          {/* Secure Comments Section */}
          <div className="mt-8">
            <SecureCommentsSection
              articleId={id || ''}
              title={article.title}
              onAuthRequired={handleAuthRequired}
            />
          </div>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default ArticleDetail;
