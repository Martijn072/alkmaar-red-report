import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  wordpress_user_id?: number;
  author_name: string;
  author_email: string | null;
  author_avatar_url: string | null;
  content: string;
  parent_id: string | null;
  likes_count: number;
  is_approved: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface CommentFormData {
  author_name: string;
  author_email?: string;
  content: string;
  parent_id?: string | null;
}

export interface WordPressCommentData {
  wordpress_user_id: number;
  author_avatar_url?: string;
}

export const useComments = (articleId: string) => {
  const { toast } = useToast();
  
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      console.log('🔍 Fetching comments for article:', articleId);
      const { data, error } = await supabase
        .from('secure_comments')
        .select('*')
        .eq('article_id', articleId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching comments:', error);
        throw error;
      }
      
      console.log('✅ Comments fetched:', data);
      
      // Map the secure_comments data to match our Comment interface
      const mappedComments = data.map(comment => ({
        ...comment,
        author_name: comment.author_name || 'Anonymous User',
        author_email: comment.author_email || null,
        author_avatar_url: comment.author_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`,
      })) as Comment[];
      
      // Organize comments with replies
      const organizedComments = organizeCommentsWithReplies(mappedComments);
      return organizedComments;
    },
  });

  return {
    comments,
    isLoading,
  };
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      articleId, 
      commentData, 
      wordpressData 
    }: { 
      articleId: string; 
      commentData: CommentFormData;
      wordpressData?: WordPressCommentData;
    }) => {
      console.log('💬 Adding new comment:', commentData);
      
      // For WordPress authenticated users
      if (wordpressData?.wordpress_user_id) {
        const { data, error } = await supabase
          .from('secure_comments')
          .insert({
            article_id: articleId,
            content: commentData.content,
            author_name: commentData.author_name,
            author_email: commentData.author_email || null,
            author_avatar_url: wordpressData.author_avatar_url || null,
            wordpress_user_id: wordpressData.wordpress_user_id,
            parent_id: commentData.parent_id || null,
            user_id: `wp-${wordpressData.wordpress_user_id}`, // Use WordPress ID as user_id
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error adding comment:', error);
          throw error;
        }

        console.log('✅ Comment added:', data);
        return data;
      } else {
        // Fallback for anonymous users (if needed)
        const { data, error } = await supabase
          .from('secure_comments')
          .insert({
            article_id: articleId,
            content: commentData.content,
            author_name: commentData.author_name,
            author_email: commentData.author_email || null,
            parent_id: commentData.parent_id || null,
            user_id: 'anonymous-user',
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error adding comment:', error);
          throw error;
        }

        console.log('✅ Comment added:', data);
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.articleId] });
      toast({
        title: "Reactie geplaatst",
        description: "Je reactie is succesvol toegevoegd!",
        className: "bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 text-premium-gray-900 dark:text-white",
      });
    },
    onError: (error) => {
      console.error('❌ Error in add comment mutation:', error);
      toast({
        title: "Fout",
        description: "Kon reactie niet plaatsen. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ commentId, userIdentifier }: { commentId: string; userIdentifier: string }) => {
      console.log('👍 Toggling like for comment:', commentId);
      
      // Check if already liked using comment_reactions
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userIdentifier)
        .eq('reaction_type', 'like')
        .single();

      if (existingReaction) {
        // Unlike: remove the reaction
        const { error } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userIdentifier)
          .eq('reaction_type', 'like');

        if (error) throw error;
        
        return { action: 'unliked' };
      } else {
        // Like: add the reaction
        const { error } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: userIdentifier,
            reaction_type: 'like',
          });

        if (error) throw error;
        
        return { action: 'liked' };
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (error) => {
      console.error('❌ Error toggling like:', error);
      toast({
        title: "Fout",
        description: "Kon reactie niet liken. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });
};

// Helper function to organize comments with replies
const organizeCommentsWithReplies = (comments: Comment[]): Comment[] => {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // Initialize all comments in map
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Organize replies
  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies!.push(commentMap.get(comment.id)!);
      }
    } else {
      rootComments.push(commentMap.get(comment.id)!);
    }
  });

  return rootComments;
};