import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ForumPost {
  title: string;
  link: string;
  pubDate: string;
  author?: string;
  category?: string;
  content?: string;
}

export const useForumRSS = () => {
  return useQuery({
    queryKey: ['forum-rss'],
    queryFn: async (): Promise<ForumPost[]> => {
      const { data, error } = await supabase.functions.invoke('forum-rss');
      
      if (error) {
        console.error('Error fetching forum RSS:', error);
        throw error;
      }
      
      return data?.posts || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
