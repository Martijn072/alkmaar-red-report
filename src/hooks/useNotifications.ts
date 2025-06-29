
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string | null;
  type: 'article' | 'goal' | 'match' | 'breaking' | 'instagram' | 'twitter';
  title: string;
  description: string | null;
  icon: string;
  read: boolean;
  article_id: string | null;
  match_id: string | null;
  social_media_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { toast } = useToast();
  
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      console.log('🔔 Fetching notifications...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }
      
      console.log('✅ Notifications fetched:', data);
      return data as Notification[];
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
  };
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('📖 Marking notification as read:', notificationId);
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error marking as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kon notificatie niet als gelezen markeren",
        variant: "destructive",
      });
    },
  });
};

export const useClearAllNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log('🗑️ Clearing all notifications...');
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('❌ Error clearing notifications:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Voltooid",
        description: "Alle notificaties gemarkeerd als gelezen",
        className: "bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 text-premium-gray-900 dark:text-white",
      });
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kon notificaties niet wissen",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('🗑️ Deleting notification:', notificationId);
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error deleting notification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kon notificatie niet verwijderen",
        variant: "destructive",
      });
    },
  });
};
