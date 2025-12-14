import { MessageSquare, ArrowRight } from "lucide-react";
import { useForumRSS } from "@/hooks/useForumRSS";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

export const ForumPostsWidget = () => {
  const { data: posts, isLoading, error } = useForumRSS();

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: nl });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-az-red" />
            <span className="font-headline text-lg font-semibold text-foreground">Forum</span>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !posts || posts.length === 0) {
    return (
      <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-az-red" />
            <span className="font-headline text-lg font-semibold text-foreground">Forum</span>
          </div>
          <a
            href="https://www.azfanpage.nl/forum/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-az-red hover:underline flex items-center gap-1"
          >
            Bekijk alles
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Bezoek het forum voor de laatste discussies
        </p>
      </div>
    );
  }

  return (
    <div className="card-premium dark:bg-gray-800 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-az-red" />
          <span className="font-headline text-lg font-semibold text-foreground">Forum</span>
        </div>
        <a
          href="https://www.azfanpage.nl/forum/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-az-red hover:underline flex items-center gap-1"
        >
          Bekijk alles
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-3">
        {posts.slice(0, 5).map((post, index) => (
          <a
            key={index}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className={`pb-3 ${index < posts.length - 1 ? 'border-b border-border' : ''}`}>
              {post.category && (
                <span className="text-xs text-az-red font-medium mb-1 block">
                  {post.category}
                </span>
              )}
              <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-az-red transition-colors">
                {post.title}
              </h4>
              <span className="text-xs text-muted-foreground mt-1 block">
                {formatRelativeTime(post.pubDate)}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
