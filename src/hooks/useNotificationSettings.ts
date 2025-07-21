import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWordPressAuth } from '@/contexts/WordPressAuthContext';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_new_comments: boolean | null;
  email_comment_replies: boolean | null;
  push_new_comments: boolean | null;
  push_comment_replies: boolean | null;
  push_new_articles: boolean | null;
  push_live_matches: boolean | null;
  push_social_media: boolean | null;
  in_app_notifications: boolean | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useNotificationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: wordpressUser, isAuthenticated } = useWordPressAuth();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['notification-settings', wordpressUser?.supabase_user_id],
    queryFn: async () => {
      if (!isAuthenticated || !wordpressUser?.supabase_user_id) {
        throw new Error('User not authenticated');
      }

      console.log('🔔 Fetching notification settings for user:', wordpressUser.supabase_user_id);
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', wordpressUser.supabase_user_id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default settings
          console.log('📝 Creating default notification settings for WordPress user...');
          
          const { data: newSettings, error: createError } = await supabase
            .from('notification_settings')
            .insert({
              user_id: wordpressUser.supabase_user_id,
              email_new_comments: true,
              email_comment_replies: true,
              push_new_comments: false,
              push_comment_replies: true,
              push_new_articles: true,
              push_live_matches: true,
              push_social_media: false,
              in_app_notifications: true,
            })
            .select()
            .single();
          
          if (createError) {
            console.error('❌ Error creating notification settings:', createError);
            throw createError;
          }
          
          console.log('✅ Default notification settings created:', newSettings);
          return newSettings as NotificationSettings;
        } else {
          console.error('❌ Error fetching notification settings:', error);
          throw error;
        }
      }
      
      console.log('✅ Notification settings fetched:', data);
      return data as NotificationSettings;
    },
    enabled: isAuthenticated && !!wordpressUser?.supabase_user_id,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<NotificationSettings>) => {
      if (!wordpressUser?.supabase_user_id) {
        throw new Error('User not authenticated');
      }

      console.log('💾 Updating notification settings:', newSettings);
      const { data, error } = await supabase
        .from('notification_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', wordpressUser.supabase_user_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating notification settings:', error);
        throw error;
      }

      console.log('✅ Notification settings updated:', data);
      return data as NotificationSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-settings'], data);
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
    onError: (error) => {
      console.error('❌ Failed to update notification settings:', error);
      toast({
        title: "Fout",
        description: "Kon instellingen niet bijwerken",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};