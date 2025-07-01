
import React, { useState } from 'react';
import { Heart, Reply, MoreVertical, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Comment, useLikeComment } from '@/hooks/useComments';
import { CommentForm } from './CommentForm';

interface CommentCardProps {
  comment: Comment;
  articleId: string;
  depth?: number;
}

export const CommentCard = ({ comment, articleId, depth = 0 }: CommentCardProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const likeComment = useLikeComment();

  const userIdentifier = `anonymous_user_${Math.random().toString(36).substr(2, 9)}`;

  const handleLike = async () => {
    try {
      await likeComment.mutateAsync({
        commentId: comment.id,
        userIdentifier,
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-premium-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <article className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700 p-4 mb-4 hover:shadow-sm transition-shadow">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={comment.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_name}`}
              alt={comment.author_name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h4 className="headline-premium text-headline-sm text-az-black dark:text-white font-semibold">
                {comment.author_name}
              </h4>
              <p className="text-xs text-premium-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: nl,
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {comment.is_pinned && (
              <Pin className="w-4 h-4 text-az-red" />
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-4">
          <p className="body-premium text-body-md text-premium-gray-700 dark:text-gray-300 leading-relaxed">
            {comment.content}
          </p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center gap-2 h-8 px-3 rounded-full transition-colors ${
              isLiked 
                ? 'text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                : 'text-premium-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{comment.likes_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-2 h-8 px-3 rounded-full text-premium-gray-600 dark:text-gray-400 hover:text-az-red hover:bg-az-red/10"
          >
            <Reply className="w-4 h-4" />
            <span className="text-sm font-medium">Reageren</span>
          </Button>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-4 pt-4 border-t border-premium-gray-200 dark:border-gray-700">
            <CommentForm
              articleId={articleId}
              parentId={comment.id}
              onSuccess={handleReplySuccess}
              placeholder={`Reageer op ${comment.author_name}...`}
              compact={true}
            />
          </div>
        )}
      </article>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              articleId={articleId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
