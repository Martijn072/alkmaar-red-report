import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DisqusComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
  };
  likes: number;
  dislikes: number;
  parentId: string | null;
}

interface DisqusCommentsResponse {
  comments: DisqusComment[];
  totalComments: number;
  threadId?: string;
}

export const useDisqusComments = (articleId: string, articleSlug?: string) => {
  return useQuery({
    queryKey: ['disqus-comments', articleId],
    queryFn: async (): Promise<DisqusCommentsResponse> => {
      const articleUrl = `https://www.azfanpage.nl/${articleSlug || articleId}/`;
      
      console.log('Fetching Disqus comments for:', { articleId, articleUrl });
      
      const { data, error } = await supabase.functions.invoke('disqus-comments', {
        body: {
          articleIdentifier: articleId,
          articleUrl,
        },
      });

      if (error) {
        console.error('Error fetching Disqus comments:', error);
        throw error;
      }

      console.log('Disqus comments response:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
