
import React, { useState } from 'react';
import { MessageCircle, Users, SortAsc, SortDesc, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useComments } from '@/hooks/useComments';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';

interface WordPressCommentsProps {
  articleId: string;
  title: string;
}

export const WordPressComments = ({ articleId, title }: WordPressCommentsProps) => {
  const { comments, isLoading } = useComments(articleId);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  const filteredAndSortedComments = React.useMemo(() => {
    let filtered = comments;

    // Filter by search term
    if (searchTerm) {
      filtered = comments.filter(comment =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort comments
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_liked':
          return b.likes_count - a.likes_count;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [comments, searchTerm, sortOrder]);

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Refined Header */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-az-red flex-shrink-0" />
          <h3 className="headline-premium text-headline-md text-az-black dark:text-white font-semibold">
            Reacties
          </h3>
          {totalComments > 0 && (
            <Badge variant="secondary" className="bg-az-red text-white text-xs px-2 py-0.5 font-medium">
              {totalComments}
            </Badge>
          )}
        </div>
        
        <Button
          onClick={() => setShowCommentForm(!showCommentForm)}
          size="sm"
          className="bg-az-red hover:bg-red-700 text-white px-3 py-1.5 text-sm font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4 mr-1.5" />
          Reageren
        </Button>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700 p-4">
          <h4 className="headline-premium text-headline-sm mb-3 text-az-black dark:text-white font-medium">
            Deel je mening
          </h4>
          <CommentForm
            articleId={articleId}
            onSuccess={() => setShowCommentForm(false)}
          />
        </div>
      )}

      {/* Compact Controls */}
      {comments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700 p-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-1.5 text-premium-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {totalComments} reactie{totalComments !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-premium-gray-400" />
                <Input
                  placeholder="Zoeken..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-40 h-8 text-sm bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600"
                />
              </div>
              
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-32 h-8 text-sm bg-white dark:bg-gray-700 border-premium-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-1.5">
                      <SortDesc className="w-3.5 h-3.5" />
                      <span className="text-sm">Nieuwste</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-1.5">
                      <SortAsc className="w-3.5 h-3.5" />
                      <span className="text-sm">Oudste</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="most_liked">
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="text-sm">Populairste</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-az-red mx-auto"></div>
          <p className="mt-3 body-premium text-sm text-premium-gray-600 dark:text-gray-400">
            Reacties laden...
          </p>
        </div>
      ) : filteredAndSortedComments.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-premium-gray-200 dark:border-gray-700">
          <MessageCircle className="w-12 h-12 text-premium-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h4 className="headline-premium text-headline-sm mb-2 text-premium-gray-600 dark:text-gray-400">
            {searchTerm ? 'Geen reacties gevonden' : 'Nog geen reacties'}
          </h4>
          <p className="body-premium text-sm text-premium-gray-500 dark:text-gray-500 mb-4">
            {searchTerm 
              ? 'Probeer een andere zoekterm.' 
              : 'Wees de eerste om te reageren op dit artikel!'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowCommentForm(true)}
              size="sm"
              className="bg-az-red hover:bg-red-700 text-white px-4 py-2"
            >
              Eerste reactie plaatsen
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              articleId={articleId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
