import { useDisqusComments, DisqusComment } from '@/hooks/useDisqusComments';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { MessageSquare, ThumbsUp, ThumbsDown, ExternalLink, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface DisqusCommentsProps {
  articleId: string;
  articleTitle: string;
  articleSlug?: string;
}

export const DisqusComments = ({ articleId, articleTitle, articleSlug }: DisqusCommentsProps) => {
  const { data, isLoading, error } = useDisqusComments(articleId, articleSlug);
  
  const disqusUrl = `https://www.azfanpage.nl/${articleSlug || articleId}/#disqus_thread`;
  
  // Build nested comments structure
  const buildNestedComments = (comments: DisqusComment[]) => {
    const commentMap = new Map<string, DisqusComment & { replies: DisqusComment[] }>();
    const rootComments: (DisqusComment & { replies: DisqusComment[] })[] = [];
    
    // First pass: create map with replies array
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });
    
    // Second pass: organize into tree
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    });
    
    return rootComments;
  };

  const renderComment = (comment: DisqusComment & { replies?: DisqusComment[] }, depth = 0) => {
    const maxDepth = 3;
    const actualDepth = Math.min(depth, maxDepth);
    
    return (
      <div key={comment.id} className={`${actualDepth > 0 ? 'ml-6 md:ml-10 border-l-2 border-border pl-4' : ''}`}>
        <div className="py-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {comment.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground text-sm">
                  {comment.author.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { 
                    addSuffix: true, 
                    locale: nl 
                  })}
                </span>
              </div>
              
              <div 
                className="mt-1.5 text-sm text-foreground/90 prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
              
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {comment.likes > 0 && (
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {comment.likes}
                  </span>
                )}
                {comment.dislikes > 0 && (
                  <span className="flex items-center gap-1">
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {comment.dislikes}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map(reply => renderComment(reply as DisqusComment & { replies?: DisqusComment[] }, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reacties
          {data?.totalComments ? (
            <span className="text-sm font-normal text-muted-foreground">
              ({data.totalComments})
            </span>
          ) : null}
        </h3>
        
        <Button
          variant="outline"
          size="sm"
          asChild
          className="text-xs"
        >
          <a href={disqusUrl} target="_blank" rel="noopener noreferrer">
            Reageer op de website
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </a>
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Reacties laden...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Kon reacties niet laden.</p>
          <a 
            href={disqusUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm mt-2 inline-block"
          >
            Bekijk reacties op de website →
          </a>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          {data.comments.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">
                Nog geen reacties op dit artikel.
              </p>
              <a 
                href={disqusUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm mt-2 inline-block"
              >
                Wees de eerste om te reageren →
              </a>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {buildNestedComments(data.comments).map(comment => renderComment(comment))}
            </div>
          )}
          
          {data.comments.length > 0 && (
            <div className="mt-6 text-center">
              <a 
                href={disqusUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Alle reacties bekijken en reageren op de website →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
};
