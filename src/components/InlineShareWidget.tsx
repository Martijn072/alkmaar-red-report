import { Link, MessageCircle, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Custom X (Twitter) icon
const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface InlineShareWidgetProps {
  article: {
    title: string;
    slug: string;
  };
}

export const InlineShareWidget = ({ article }: InlineShareWidgetProps) => {
  const { toast } = useToast();

  // Generate main site URL for sharing (all shares go to azfanpage.nl, not app.azfanpage.nl)
  const getMainSiteUrl = () => {
    return `https://www.azfanpage.nl/${article.slug}`;
  };

  const handleCopyLink = async () => {
    try {
      const url = getMainSiteUrl();
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
    const url = getMainSiteUrl();
    const text = `${article.title} - ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const url = getMainSiteUrl();
    const text = `${article.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const url = getMainSiteUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareButtons = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      onClick: handleWhatsAppShare,
      bgColor: "bg-[#25D366] hover:bg-[#20BD5A]",
    },
    {
      name: "Facebook",
      icon: Facebook,
      onClick: handleFacebookShare,
      bgColor: "bg-[#1877F2] hover:bg-[#1565C0]",
    },
    {
      name: "X",
      icon: XIcon,
      onClick: handleTwitterShare,
      bgColor: "bg-foreground hover:bg-foreground/80",
    },
    {
      name: "Kopieer link",
      icon: Link,
      onClick: handleCopyLink,
      bgColor: "bg-primary hover:bg-primary/80",
    },
  ];

  return (
    <div className="mt-8 p-5 bg-muted/50 border border-border rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-base font-semibold text-foreground">
            Deel dit artikel
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vond je dit interessant? Deel het met anderen
          </p>
        </div>
        
        <div className="flex items-center justify-center sm:justify-end gap-3">
          {shareButtons.map((button) => (
            <button
              key={button.name}
              onClick={button.onClick}
              className={`p-3 rounded-full text-white transition-all duration-200 ${button.bgColor}`}
              aria-label={button.name}
              title={button.name}
            >
              <button.icon />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
