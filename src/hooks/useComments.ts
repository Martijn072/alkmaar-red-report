
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  article_id: string;
  user_id: string | null;
  author_name: string;
  author_email: string | null;
  author_avatar: string | null;
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
  parent_id?: string;
}

export const useComments = (articleId: string) => {
  const { toast } = useToast();
  
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      console.log('🔍 Fetching comments for article:', articleId);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching comments:', error);
        throw error;
      }
      
      console.log('✅ Comments fetched:', data);
      
      // Organize comments with replies
      const organizedComments = organizeCommentsWithReplies(data as Comment[]);
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
    mutationFn: async ({ articleId, commentData }: { articleId: string; commentData: CommentFormData }) => {
      console.log('💬 Adding new comment:', commentData);
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          author_name: commentData.author_name,
          author_email: commentData.author_email,
          content: commentData.content,
          parent_id: commentData.parent_id || null,
          author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${commentData.author_name}`,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding comment:', error);
        throw error;
      }

      console.log('✅ Comment added:', data);
      return data;
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
      
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_identifier', userIdentifier)
        .single();

      if (existingLike) {
        // Unlike: remove the like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_identifier', userIdentifier);

        if (error) throw error;

        // Get current likes count and decrease by 1
        const { data: currentComment } = await supabase
          .from('comments')
          .select('likes_count')
          .eq('id', commentId)
          .single();

        if (currentComment) {
          const newCount = Math.max(0, (currentComment.likes_count || 0) - 1);
          const { error: updateError } = await supabase
            .from('comments')
            .update({ likes_count: newCount })
            .eq('id', commentId);

          if (updateError) throw updateError;
        }
        
        return { action: 'unliked' };
      } else {
        // Like: add the like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_identifier: userIdentifier,
          });

        if (error) throw error;

        // Get current likes count and increase by 1
        const { data: currentComment } = await supabase
          .from('comments')
          .select('likes_count')
          .eq('id', commentId)
          .single();

        if (currentComment) {
          const newCount = (currentComment.likes_count || 0) + 1;
          const { error: updateError } = await supabase
            .from('comments')
            .update({ likes_count: newCount })
            .eq('id', commentId);

          if (updateError) throw updateError;
        }
        
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
