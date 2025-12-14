import { useState, useCallback } from 'react';
import { useWordPressAuth } from '@/contexts/WordPressAuthContext';

const WORDPRESS_API_BASE = 'https://www.azfanpage.nl/wp-json/wp/v2';

export interface WordPressComment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  date_gmt: string;
  content: {
    rendered: string;
  };
  author_avatar_urls?: {
    '24'?: string;
    '48'?: string;
    '96'?: string;
  };
  status: string;
}

interface UseWordPressCommentsReturn {
  comments: WordPressComment[];
  isLoading: boolean;
  isPosting: boolean;
  error: string | null;
  fetchComments: (postId: string) => Promise<void>;
  postComment: (postId: string, content: string, parentId?: number) => Promise<boolean>;
  totalComments: number;
}

export const useWordPressComments = (): UseWordPressCommentsReturn => {
  const [comments, setComments] = useState<WordPressComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalComments, setTotalComments] = useState(0);

  const { user, isAuthenticated } = useWordPressAuth();

  const fetchComments = useCallback(async (postId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📬 Fetching WordPress comments for post:', postId);
      
      const response = await fetch(
        `${WORDPRESS_API_BASE}/comments?post=${postId}&per_page=100&orderby=date_gmt&order=asc`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data: WordPressComment[] = await response.json();
      const total = response.headers.get('X-WP-Total');
      
      console.log('✅ Fetched', data.length, 'comments');
      setComments(data);
      setTotalComments(total ? parseInt(total, 10) : data.length);
    } catch (err) {
      console.error('❌ Error fetching comments:', err);
      setError('Kon reacties niet laden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const postComment = useCallback(async (
    postId: string, 
    content: string, 
    parentId?: number
  ): Promise<boolean> => {
    if (!isAuthenticated || !user?.token) {
      setError('Je moet ingelogd zijn om te reageren');
      return false;
    }

    setIsPosting(true);
    setError(null);

    try {
      console.log('📝 Posting comment to post:', postId);

      const body: Record<string, unknown> = {
        post: parseInt(postId, 10),
        content: content,
      };

      if (parentId) {
        body.parent = parentId;
      }

      const response = await fetch(`${WORDPRESS_API_BASE}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Comment post failed:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Sessie verlopen. Log opnieuw in.');
        }
        
        throw new Error(errorData.message || 'Kon reactie niet plaatsen');
      }

      const newComment: WordPressComment = await response.json();
      console.log('✅ Comment posted successfully:', newComment.id);

      // Add the new comment to the list
      setComments(prev => [...prev, newComment]);
      setTotalComments(prev => prev + 1);
      
      return true;
    } catch (err) {
      console.error('❌ Error posting comment:', err);
      setError(err instanceof Error ? err.message : 'Kon reactie niet plaatsen');
      return false;
    } finally {
      setIsPosting(false);
    }
  }, [isAuthenticated, user]);

  return {
    comments,
    isLoading,
    isPosting,
    error,
    fetchComments,
    postComment,
    totalComments,
  };
};
