
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  category: string;
  isBreaking: boolean;
  readTime: string;
}

export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async (): Promise<Article[]> => {
      console.log('Fetching articles from Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('fetch-articles');
      
      if (error) {
        console.error('Error calling Edge Function:', error);
        throw new Error('Failed to fetch articles');
      }
      
      if (!data || !data.articles) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format');
      }
      
      console.log(`Successfully fetched ${data.articles.length} articles`);
      return data.articles;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
