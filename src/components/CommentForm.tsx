import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddComment } from '@/hooks/useComments';
import { useWordPressAuth } from '@/contexts/WordPressAuthContext';
import { UserAvatar } from '@/components/UserAvatar';

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  compact?: boolean;
}

export const CommentForm = ({ 
  articleId, 
  parentId, 
  onSuccess, 
  placeholder = "Deel je mening over dit artikel...",
  compact = false 
}: CommentFormProps) => {
  const [content, setContent] = useState('');
  const { user, isAuthenticated } = useWordPressAuth();
  const addComment = useAddComment();

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-muted/50 rounded-lg p-6 text-center border border-border">
        <p className="text-muted-foreground mb-4">
          Je moet ingelogd zijn om een reactie te plaatsen
        </p>
        <Button asChild variant="default">
          <a href="/auth">Inloggen</a>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    try {
      await addComment.mutateAsync({
        articleId,
        commentData: {
          content: content.trim(),
          author_name: user.display_name,
          author_email: user.email,
          parent_id: parentId || null
        },
        wordpressData: {
          wordpress_user_id: user.id,
          author_avatar_url: user.avatar_url
        }
      });
      
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <div className="space-y-4 bg-card rounded-lg p-4 border border-border">
      <div className="flex items-start gap-3">
        <UserAvatar size="md" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-3">
            Reageren als {user.display_name}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Textarea
                placeholder={placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-background border-border focus:border-primary min-h-[100px] resize-none pr-12"
                required
                maxLength={1000}
              />
              <Button
                type="submit"
                disabled={addComment.isPending || !content.trim()}
                className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-full"
              >
                {addComment.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{content.length}/1000 tekens</span>
              {content.trim() && (
                <span className="text-green-600 dark:text-green-400">
                  Druk Enter + Ctrl om te verzenden
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};