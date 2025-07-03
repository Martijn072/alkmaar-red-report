import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  X,
  Volume2
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface MiniAudioPlayerProps {
  title: string;
  onClose: () => void;
  onExpand: () => void;
}

export const MiniAudioPlayer: React.FC<MiniAudioPlayerProps> = ({
  title,
  onClose,
  onExpand
}) => {
  const {
    state,
    pause,
    resume,
  } = useTextToSpeech();

  if (!state.isPlaying && !state.isPaused) {
    return null;
  }

  const handlePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else if (state.isPaused) {
      resume();
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 p-3">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          size="icon"
          variant="default"
          className="h-10 w-10 rounded-full bg-az-red hover:bg-red-700 flex-shrink-0"
        >
          {state.isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        {/* Content */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onExpand}
        >
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="h-3 w-3 text-az-red flex-shrink-0" />
            <span className="text-sm font-medium text-premium-gray-700 dark:text-gray-300 truncate">
              {title}
            </span>
          </div>
          
          <Progress 
            value={state.progress} 
            className="h-1.5" 
          />
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="h-8 w-8 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};