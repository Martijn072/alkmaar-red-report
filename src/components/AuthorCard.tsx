
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { X, Facebook, Instagram } from "lucide-react";

interface AuthorInfo {
  id: number;
  name: string;
  description: string;
  avatar: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

interface AuthorCardProps {
  author: string;
  authorInfo?: AuthorInfo;
}

export const AuthorCard = ({ author, authorInfo }: AuthorCardProps) => {
  if (!authorInfo) {
    // Simple fallback version with just the name
    return (
      <div className="border-t border-premium-gray-200 dark:border-gray-700 pt-6 mt-8">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-az-red text-white font-medium">
              {author.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-az-black dark:text-white">{author}</p>
            <p className="text-sm text-premium-gray-600 dark:text-gray-400">AZFanpage Redactie</p>
          </div>
        </div>
      </div>
    );
  }

  const { name, description, avatar, socialLinks } = authorInfo;
  const hasDescription = description && description.trim().length > 0;
  const hasSocialLinks = socialLinks && (socialLinks.twitter || socialLinks.instagram || socialLinks.facebook);

  return (
    <Card className="border-premium-gray-200 dark:border-gray-700 mt-8">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-az-red text-white font-medium">
              {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-az-black dark:text-white">{name}</h3>
              
              {hasSocialLinks && (
                <div className="flex items-center gap-2">
                  {socialLinks?.twitter && (
                    <a
                      href={socialLinks.twitter.startsWith('http') ? socialLinks.twitter : `https://twitter.com/${socialLinks.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full bg-black hover:bg-gray-800 text-white transition-colors"
                      title="Twitter"
                    >
                      <X className="w-3 h-3" />
                    </a>
                  )}
                  {socialLinks?.instagram && (
                    <a
                      href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://instagram.com/${socialLinks.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="w-3 h-3" />
                    </a>
                  )}
                  {socialLinks?.facebook && (
                    <a
                      href={socialLinks.facebook.startsWith('http') ? socialLinks.facebook : `https://facebook.com/${socialLinks.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {hasDescription && (
              <p className="text-sm text-premium-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                {description}
              </p>
            )}
            
            {!hasDescription && (
              <p className="text-sm text-premium-gray-600 dark:text-gray-400">
                AZFanpage Redactie
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
