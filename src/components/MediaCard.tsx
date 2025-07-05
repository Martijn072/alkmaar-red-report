
import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { SupporterMedia, useVoteMedia, useReportMedia } from '@/hooks/useSupporterMedia';
import { ThumbsUp, ThumbsDown, Flag, Share2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'sonner';

interface MediaCardProps {
  media: SupporterMedia;
}

export const MediaCard = ({ media }: MediaCardProps) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  const voteMutation = useVoteMedia();
  const reportMutation = useReportMedia();
  
  const handleVote = async (voteType: 'up' | 'down') => {
    try {
      // Use anonymous identifier for now
      const userIdentifier = `anon-${localStorage.getItem('userId') || Date.now()}`;
      
      await voteMutation.mutateAsync({
        mediaId: media.id,
        voteType,
        userIdentifier,
      });
      
      setUserVote(voteType);
      toast.success(`${voteType === 'up' ? '👍' : '👎'} Vote geregistreerd!`);
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Stemmen mislukt');
    }
  };
  
  const handleReport = async (reason: string) => {
    try {
      const reporterIdentifier = `anon-${localStorage.getItem('userId') || Date.now()}`;
      
      await reportMutation.mutateAsync({
        mediaId: media.id,
        reason,
        reporterIdentifier,
      });
      
      toast.success('Rapportage verzonden');
      setShowReportDialog(false);
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Rapportage mislukt');
    }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AZ Supporter Media',
          text: media.caption || 'Bekijk deze AZ foto/video!',
          url: media.file_url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(media.file_url);
      toast.success('Link gekopieerd!');
    }
  };
  
  return (
    <Card className="overflow-hidden">
      {/* Media Content */}
      <div className="relative">
        {media.file_type === 'image' ? (
          <img
            src={media.thumbnail_url || media.file_url}
            alt={media.caption || 'AZ supporter media'}
            className="w-full h-64 object-cover cursor-pointer"
            onClick={() => window.open(media.file_url, '_blank')}
          />
        ) : (
          <video
            src={media.file_url}
            className="w-full h-64 object-cover"
            controls
            preload="metadata"
          />
        )}
        
        {media.is_featured && (
          <div className="absolute top-2 left-2 bg-az-red text-white px-2 py-1 rounded text-xs font-semibold">
            🏆 Foto van de Week
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Caption */}
        {media.caption && (
          <p className="text-az-black dark:text-white text-sm">{media.caption}</p>
        )}
        
        {/* Hashtags */}
        {media.hashtags && media.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {media.hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-az-red/10 text-az-red px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-premium-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>AZ Supporter</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(media.created_at), {
              addSuffix: true,
              locale: nl,
            })}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-premium-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Vote Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('up')}
                className={`flex items-center space-x-1 ${
                  userVote === 'up' ? 'text-green-600' : 'text-premium-gray-500'
                }`}
                disabled={voteMutation.isPending}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{media.votes_count}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down')}
                className={`${
                  userVote === 'down' ? 'text-red-600' : 'text-premium-gray-500'
                }`}
                disabled={voteMutation.isPending}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Share Button */}
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
            
            {/* Report Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowReportDialog(true)}
              className="text-premium-gray-400 hover:text-red-500"
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Simple Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Content rapporteren</h3>
            <div className="space-y-2">
              {['Ongepaste inhoud', 'Spam', 'Misleidend', 'Auteursrecht'].map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleReport(reason)}
                  disabled={reportMutation.isPending}
                >
                  {reason}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowReportDialog(false)}
            >
              Annuleren
            </Button>
          </Card>
        </div>
      )}
    </Card>
  );
};
