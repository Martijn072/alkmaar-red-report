
import { Instagram, Twitter, ExternalLink, User } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface SocialMediaPost {
  id: string;
  platform: 'instagram' | 'twitter';
  username: string;
  profile_photo?: string;
  content: string;
  image_url?: string;
  post_url: string;
  published_at: string;
  cached_at: string;
}

interface SocialMediaCardProps {
  post: SocialMediaPost;
}

export const SocialMediaCard = ({ post }: SocialMediaCardProps) => {
  console.log('Rendering SocialMediaCard for post:', post.id);

  const handleViewPost = () => {
    console.log('Opening post URL:', post.post_url);
    window.open(post.post_url, '_blank', 'noopener,noreferrer');
  };

  const platformConfig = {
    instagram: {
      icon: Instagram,
      name: 'Instagram',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600'
    },
    twitter: {
      icon: Twitter,
      name: 'Twitter',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    }
  };

  const config = platformConfig[post.platform];
  if (!config) {
    console.error('Unknown platform:', post.platform);
    return null;
  }

  const PlatformIcon = config.icon;

  return (
    <article className="bg-card rounded-lg shadow-sm border border-border overflow-hidden w-full max-w-full group transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg">
      {/* Header met platform badge */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {post.profile_photo ? (
              <img 
                src={post.profile_photo} 
                alt={`${post.username} profile`}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  console.log('Profile photo failed to load:', post.profile_photo);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-premium-gray-500 dark:text-gray-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-az-black dark:text-white text-sm">
                @{post.username}
              </p>
              <p className="text-xs text-premium-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(post.published_at), { 
                  addSuffix: true, 
                  locale: nl 
                })}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-semibold ${config.color}`}>
            <PlatformIcon className="w-3 h-3" />
            <span>{config.name}</span>
          </div>
        </div>
      </div>

      {/* Featured image */}
      {post.image_url && (
        <div className="relative aspect-[16/9] overflow-hidden cursor-pointer mx-4 rounded-lg" onClick={handleViewPost}>
          <img 
            src={post.image_url} 
            alt="Social media post"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              console.log('Post image failed to load:', post.image_url);
              e.currentTarget.parentElement?.remove();
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-premium-gray-700 dark:text-gray-300 mb-4 line-clamp-3 break-words text-sm">
          {post.content}
        </p>

        {/* View post button */}
        <button 
          onClick={handleViewPost}
          className="flex items-center gap-2 bg-az-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 text-sm w-full justify-center group/btn"
        >
          <span>Bekijk op {config.name}</span>
          <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </article>
  );
};
