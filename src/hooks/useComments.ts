
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  content_html: string | null;
  is_approved: boolean;
  is_pinned: boolean;
  is_edited: boolean;
  edit_count: number;
  last_edited_at: string | null;
  likes_count: number;
  dislikes_count: number;
  reports_count: number;
  is_hidden: boolean;
  hidden_reason: string | null;
  spam_score: number;
  reply_count: number;
  depth: number;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
  user_profiles?: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    reputation: number;
    is_verified: boolean;
  } | null;
}

export interface CommentFormData {
  content: string;
  parent_id?: string;
}

export const useComments = (articleId: string) => {
  const { toast } = useToast();
  
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['secure_comments', articleId],
    queryFn: async () => {
      console.log('🔍 Fetching secure comments for article:', articleId);
      const { data, error } = await supabase
        .from('secure_comments')
        .select(`
          *,
          user_profiles (
            id,
            username,
            display_name,
            avatar_url,
            reputation,
            is_verified
          )
        `)
        .eq('article_id', articleId)
        .eq('is_approved', true)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching secure comments:', error);
        throw error;
      }
      
      console.log('✅ Secure comments fetched:', data);
      
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
      console.log('💬 Adding new secure comment:', commentData);
      const { data, error } = await supabase
        .from('secure_comments')
        .insert({
          article_id: articleId,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
          content: commentData.content,
          parent_id: commentData.parent_id || null,
          is_approved: false, // Will be approved by moderation
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding secure comment:', error);
        throw error;
      }

      console.log('✅ Secure comment added:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secure_comments', variables.articleId] });
      toast({
        title: "Reactie geplaatst",
        description: "Je reactie wordt gecontroleerd en verschijnt binnenkort.",
        className: "bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 text-premium-gray-900 dark:text-white",
      });
    },
    onError: (error) => {
      console.error('❌ Error in add secure comment mutation:', error);
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
    mutationFn: async ({ commentId, reactionType }: { commentId: string; reactionType: 'like' | 'dislike' }) => {
      console.log('👍 Toggling reaction for comment:', commentId, reactionType);
      
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      // Check if already reacted
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('id, reaction_type')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if same type
          const { error } = await supabase
            .from('comment_reactions')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', userId);

          if (error) throw error;
          return { action: 'removed', reactionType };
        } else {
          // Update reaction if different type
          const { error } = await supabase
            .from('comment_reactions')
            .update({ reaction_type: reactionType })
            .eq('comment_id', commentId)
            .eq('user_id', userId);

          if (error) throw error;
          return { action: 'updated', reactionType };
        }
      } else {
        // Add new reaction
        const { error } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: userId,
            reaction_type: reactionType,
          });

        if (error) throw error;
        return { action: 'added', reactionType };
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secure_comments'] });
    },
    onError: (error) => {
      console.error('❌ Error toggling reaction:', error);
      toast({
        title: "Fout",
        description: "Kon reactie niet registreren. Probeer het opnieuw.",
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
