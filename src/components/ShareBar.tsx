
import { Link, Share2, MessageCircle, Facebook, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareBarProps {
  article: {
    title: string;
    slug: string;
  };
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export const ShareBar = ({ article, showBackButton = false, onBack, className = "" }: ShareBarProps) => {
  const { toast } = useToast();

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
    const text = `${article.title} - ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const url = window.location.href;
    const text = `${article.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  return (
    <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-premium-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-premium-gray-600 dark:text-gray-300 hover:text-az-red dark:hover:text-az-red transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Terug</span>
            </button>
          )}
          
          {!showBackButton && (
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-premium-gray-500 dark:text-gray-400" />
              <span className="text-sm text-premium-gray-600 dark:text-gray-300">Deel dit artikel:</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {!showBackButton && (
              <span className="text-xs text-premium-gray-500 dark:text-gray-400 mr-2">Delen:</span>
            )}
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
  );
};
