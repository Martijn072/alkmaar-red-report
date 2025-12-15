import { MessageSquare, ExternalLink, Clock, User, Tag, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useForumRSS, ForumPost } from "@/hooks/useForumRSS";
import { useState, useMemo } from "react";

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Zojuist";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min geleden`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} uur geleden`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dagen geleden`;
  
  return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
};

const ForumPostCard = ({ post }: { post: ForumPost }) => (
  <a
    href={post.link}
    target="_blank"
    rel="noopener noreferrer"
    className="block"
  >
    <Card className="p-4 hover:bg-muted/50 transition-colors border-border">
      <div className="space-y-2">
        {post.category && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Tag className="w-3 h-3" />
            <span>{post.category}</span>
          </div>
        )}
        
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-az-red transition-colors">
          {post.title}
        </h3>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{post.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(post.pubDate)}</span>
          </div>
        </div>
      </div>
    </Card>
  </a>
);

const ForumSkeleton = () => (
  <div className="space-y-3">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: { 
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    <Badge
      variant={selectedCategory === null ? "default" : "outline"}
      className={`cursor-pointer transition-colors ${
        selectedCategory === null 
          ? "bg-az-red hover:bg-az-red/90 text-white" 
          : "hover:bg-muted"
      }`}
      onClick={() => onCategoryChange(null)}
    >
      Alles
    </Badge>
    {categories.map((category) => (
      <Badge
        key={category}
        variant={selectedCategory === category ? "default" : "outline"}
        className={`cursor-pointer transition-colors ${
          selectedCategory === category 
            ? "bg-az-red hover:bg-az-red/90 text-white" 
            : "hover:bg-muted"
        }`}
        onClick={() => onCategoryChange(category)}
      >
        {category}
      </Badge>
    ))}
  </div>
);

const Forum = () => {
  const [activeTab, setActiveTab] = useState("forum");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: posts, isLoading, error, refetch } = useForumRSS();
  const forumUrl = "https://www.azfanpage.nl/forum/";

  // Extract unique categories from posts
  const categories = useMemo(() => {
    if (!posts) return [];
    const uniqueCategories = [...new Set(posts.map(p => p.category).filter(Boolean))] as string[];
    return uniqueCategories.sort();
  }, [posts]);

  // Filter posts by selected category
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!selectedCategory) return posts;
    return posts.filter(post => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-az-red/10 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-az-red" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              AZ Forum
            </h1>
            <p className="text-muted-foreground mb-6">
              Praat mee met andere AZ supporters over alles wat met AZ te maken heeft.
            </p>
            
            {/* Prominent CTA Button */}
            <Button
              size="lg"
              className="bg-az-red hover:bg-az-red/90 text-white gap-2 shadow-lg"
              onClick={() => window.open(forumUrl, '_blank')}
            >
              <ExternalLink className="w-5 h-5" />
              Open Forum
            </Button>
          </div>

          {/* Recent Posts Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Recente Discussies
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="text-muted-foreground hover:text-foreground"
              >
                Vernieuwen
              </Button>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filter op categorie:</span>
                </div>
                <CategoryFilter 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            )}

            {isLoading ? (
              <ForumSkeleton />
            ) : error ? (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Kon forumposts niet laden
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Opnieuw proberen
                </Button>
              </Card>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <div className="space-y-3">
                {filteredPosts.map((post, index) => (
                  <ForumPostCard key={index} post={post} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {selectedCategory 
                    ? `Geen discussies gevonden in "${selectedCategory}"`
                    : "Geen recente discussies gevonden"
                  }
                </p>
                {selectedCategory && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Toon alle discussies
                  </Button>
                )}
              </Card>
            )}

            {/* Bottom CTA */}
            {filteredPosts && filteredPosts.length > 0 && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(forumUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Bekijk alle discussies
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Forum;
