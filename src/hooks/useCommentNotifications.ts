
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CommentNotificationData {
  type: 'comment_reply' | 'comment_mention';
  title: string;
  description: string;
  article_id: string;
  user_email?: string;
  parent_comment_author?: string;
}

export const useCreateCommentNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationData: CommentNotificationData) => {
      console.log('🔔 Creating comment notification:', notificationData);
      
      // Create in-app notification
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notificationData.type,
          title: notificationData.title,
          description: notificationData.description,
          article_id: notificationData.article_id,
          icon: 'MessageCircle',
          read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
      }

      console.log('✅ Comment notification created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('❌ Error in comment notification mutation:', error);
      toast({
        title: "Fout",
        description: "Kon notificatie niet aanmaken",
        variant: "destructive",
      });
    },
  });
};

export const useNotificationPreferences = () => {
  return useMutation({
    mutationFn: async (preferences: {
      email: string;
      comment_replies?: boolean;
      comment_mentions?: boolean;
      email_notifications?: boolean;
      push_notifications?: boolean;
    }) => {
      console.log('⚙️ Updating notification preferences:', preferences);
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert(preferences, {
          onConflict: 'email',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating preferences:', error);
        throw error;
      }

      console.log('✅ Notification preferences updated:', data);
      return data;
    },
  });
};
