import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Loader2, Reply, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWordPressComments, WordPressComment } from '@/hooks/useWordPressComments';
import { useWordPressAuth } from '@/contexts/WordPressAuthContext';
import { useNavigate } from 'react-router-dom';

interface WordPressCommentsProps {
  articleId: string;
  articleTitle: string;
}

interface CommentItemProps {
  comment: WordPressComment;
  replies: WordPressComment[];
  allComments: WordPressComment[];
  onReply: (parentId: number) => void;
  replyingTo: number | null;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: () => void;
  isPosting: boolean;
  depth?: number;
}

const CommentItem = ({
  comment,
  replies,
  allComments,
  onReply,
  replyingTo,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  isPosting,
  depth = 0,
}: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(true);
  const maxDepth = 3;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const avatarUrl = comment.author_avatar_urls?.['48'] || comment.author_avatar_urls?.['96'];

  return (
    <div className={`${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-border pl-4' : ''}`}>
      <div className="py-4">
        {/* Comment header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={comment.author_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground">{comment.author_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.date)}
              </span>
            </div>

            {/* Comment content */}
            <div 
              className="mt-2 text-foreground prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
            />

            {/* Reply button */}
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="mt-2 text-sm text-muted-foreground hover:text-az-red flex items-center gap-1 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reageren
              </button>
            )}

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-4 space-y-3">
                <Textarea
                  value={replyContent}
                  onChange={(e) => onReplyContentChange(e.target.value)}
                  placeholder="Schrijf je reactie..."
                  className="min-h-[80px] resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={onSubmitReply}
                    disabled={!replyContent.trim() || isPosting}
                    size="sm"
                    className="bg-az-red hover:bg-red-700 text-white"
                  >
                    {isPosting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3 h-3 mr-1" />
                        Verstuur
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => onReply(0)}
                    variant="outline"
                    size="sm"
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {replies.length} {replies.length === 1 ? 'reactie' : 'reacties'}
          </button>
          
          {showReplies && (
            <div>
              {replies.map((reply) => {
                const nestedReplies = allComments.filter(c => c.parent === reply.id);
                return (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    replies={nestedReplies}
                    allComments={allComments}
                    onReply={onReply}
                    replyingTo={replyingTo}
                    replyContent={replyContent}
                    onReplyContentChange={onReplyContentChange}
                    onSubmitReply={onSubmitReply}
                    isPosting={isPosting}
                    depth={depth + 1}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const WordPressComments = ({ articleId, articleTitle }: WordPressCommentsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { comments, isLoading, isPosting, error, fetchComments, postComment, totalComments } = useWordPressComments();
  const { isAuthenticated, user } = useWordPressAuth();
  const navigate = useNavigate();

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Lazy load comments when section becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            console.log('💬 Comments section visible, loading comments...');
            fetchComments(articleId);
            setHasLoaded(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '200px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [articleId, fetchComments, hasLoaded]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    const success = await postComment(articleId, newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !replyingTo) return;
    
    const success = await postComment(articleId, replyContent, replyingTo);
    if (success) {
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleReply = (parentId: number) => {
    setReplyingTo(parentId === replyingTo ? null : parentId);
    setReplyContent('');
  };

  // Get top-level comments (no parent)
  const topLevelComments = comments.filter(c => c.parent === 0);

  return (
    <div ref={containerRef} className="mt-8 pt-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <h3 className="headline-premium text-headline-sm mb-4 text-foreground flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-az-red" />
          Reacties
          {totalComments > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({totalComments})
            </span>
          )}
        </h3>

        {/* New comment form */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>Reageren als</span>
                <span className="font-medium text-foreground">{user?.display_name || user?.username}</span>
              </div>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Deel je mening over dit artikel..."
                className="min-h-[100px] resize-none"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isPosting}
                className="bg-az-red hover:bg-red-700 text-white"
              >
                {isPosting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Reactie plaatsen
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Log in om een reactie te plaatsen
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-az-red hover:bg-red-700 text-white"
              >
                Inloggen
              </Button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-az-red" />
          </div>
        )}

        {/* Comments list */}
        {!isLoading && hasLoaded && (
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {topLevelComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  Nog geen reacties. Wees de eerste!
                </p>
              </div>
            ) : (
              <div className="px-4">
                {topLevelComments.map((comment) => {
                  const replies = comments.filter(c => c.parent === comment.id);
                  return (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      replies={replies}
                      allComments={comments}
                      onReply={handleReply}
                      replyingTo={replyingTo}
                      replyContent={replyContent}
                      onReplyContentChange={setReplyContent}
                      onSubmitReply={handleSubmitReply}
                      isPosting={isPosting}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
