
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AuthorInfo {
  id: number;
  name: string;
  description: string;
  avatar: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

interface ArticleDetail {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorInfo?: AuthorInfo;
  publishedAt: string;
  imageUrl: string;
  category: string;
  isBreaking: boolean;
  readTime: string;
  slug: string;
}

export const useArticleDetail = (id: string) => {
  return useQuery({
    queryKey: ['article-detail', id],
    queryFn: async (): Promise<ArticleDetail> => {
      console.log(`Fetching article detail for ID: ${id}`);
      
      const { data, error } = await supabase.functions.invoke('fetch-articles', {
        body: { articleId: id }
      });
      
      if (error) {
        console.error('Error calling Edge Function for article detail:', error);
        throw new Error('Failed to fetch article detail');
      }
      
      if (!data || !data.article) {
        console.error('Invalid response format for article detail:', data);
        throw new Error('Article not found');
      }
      
      console.log('Successfully fetched article detail');
      return data.article;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
};
