import React from "react";
import { ExternalLink, Twitter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

interface TweetData {
  id: string;
  text: string;
  username: string;
  displayName: string;
  createdAt: Date;
  url: string;
  hashtags: string[];
  mentions: string[];
}

interface TweetCardProps {
  tweet: TweetData;
  className?: string;
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet, className = "" }) => {
  const formatTweetText = (text: string, hashtags: string[], mentions: string[]) => {
    let formattedText = text;
    
    // Highlight hashtags in AZ red
    hashtags.forEach(hashtag => {
      const hashtagRegex = new RegExp(`#${hashtag}`, 'gi');
      formattedText = formattedText.replace(
        hashtagRegex, 
        `<span class="text-az-red font-medium">#${hashtag}</span>`
      );
    });
    
    // Highlight mentions in AZ red
    mentions.forEach(mention => {
      const mentionRegex = new RegExp(`@${mention}`, 'gi');
      formattedText = formattedText.replace(
        mentionRegex, 
        `<span class="text-az-red font-medium">@${mention}</span>`
      );
    });
    
    return formattedText;
  };

  const handleTweetClick = () => {
    window.open(tweet.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className={`
        bg-card border-l-4 border-az-red rounded-lg p-4 my-6 
        hover:shadow-md transition-all duration-200 cursor-pointer
        dark:bg-gray-800 dark:border-az-red
        ${className}
      `}
      onClick={handleTweetClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTweetClick();
        }
      }}
      aria-label={`Tweet van ${tweet.displayName}: ${tweet.text}`}
    >
      {/* Tweet Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
          <Twitter className="w-4 h-4 text-white dark:text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate">
              {tweet.displayName}
            </span>
            <span className="text-muted-foreground text-sm truncate">
              @{tweet.username}
            </span>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>

      {/* Tweet Content */}
      <div className="mb-3">
        <p 
          className="text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: formatTweetText(tweet.text, tweet.hashtags, tweet.mentions) 
          }}
        />
      </div>

      {/* Tweet Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {formatDistanceToNow(tweet.createdAt, { 
            addSuffix: true, 
            locale: nl 
          })}
        </span>
        <span className="text-az-red hover:text-red-700 font-medium">
          Bekijk op X →
        </span>
      </div>
    </div>
  );
};