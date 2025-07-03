import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack,
  Volume2,
  Settings
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface AudioControlsProps {
  text: string;
  title: string;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  text,
  title,
  isExpanded = false,
  onToggleExpanded
}) => {
  const {
    state,
    options,
    availableVoices,
    speak,
    pause,
    resume,
    stop,
    skipForward,
    skipBackward,
    updateOptions,
  } = useTextToSpeech();

  if (!state.isSupported) {
    return null;
  }

  const handlePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else if (state.isPaused) {
      resume();
    } else {
      speak(text);
    }
  };

  const formatTime = (progress: number, totalWords: number) => {
    const wordsPerMinute = 150; // Average reading speed
    const totalMinutes = totalWords / wordsPerMinute;
    const currentMinutes = (progress / 100) * totalMinutes;
    const remainingMinutes = totalMinutes - currentMinutes;
    
    const formatMinutes = (min: number) => {
      const minutes = Math.floor(min);
      const seconds = Math.floor((min - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    return {
      current: formatMinutes(currentMinutes),
      total: formatMinutes(totalMinutes),
      remaining: formatMinutes(remainingMinutes)
    };
  };

  const timeInfo = formatTime(state.progress, state.totalWords);

  return (
    <div className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      {/* Main Controls Bar */}
      <div className="flex items-center gap-3 p-4">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          size="icon"
          variant="default"
          className="h-12 w-12 rounded-full bg-az-red hover:bg-red-700"
        >
          {state.isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Article Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="h-4 w-4 text-az-red" />
            <span className="text-sm font-medium text-premium-gray-600 dark:text-gray-300 truncate">
              {title}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={state.progress} 
              className="h-2" 
            />
            <div className="flex justify-between text-xs text-premium-gray-500 dark:text-gray-400">
              <span>{timeInfo.current}</span>
              <span>-{timeInfo.remaining}</span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-1">
          <Button
            onClick={skipBackward}
            size="icon"
            variant="ghost"
            disabled={!state.isPlaying && !state.isPaused}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={stop}
            size="icon"
            variant="ghost"
            disabled={!state.isPlaying && !state.isPaused}
            className="h-8 w-8"
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            onClick={skipForward}
            size="icon"
            variant="ghost"
            disabled={!state.isPlaying && !state.isPaused}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <Button
            onClick={onToggleExpanded}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Extended Controls */}
      {isExpanded && (
        <div className="border-t border-premium-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* Speed Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-premium-gray-700 dark:text-gray-300">
              Snelheid: {options.rate}x
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-premium-gray-500">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={options.rate}
                onChange={(e) => updateOptions({ rate: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-premium-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-premium-gray-500">2x</span>
            </div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-premium-gray-700 dark:text-gray-300">
              Stem
            </label>
            <select
              value={options.voice?.name || ''}
              onChange={(e) => {
                const selectedVoice = availableVoices.find(voice => voice.name === e.target.value);
                updateOptions({ voice: selectedVoice || null });
              }}
              className="w-full p-2 border border-premium-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-premium-gray-900 dark:text-gray-100 text-sm"
            >
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-premium-gray-700 dark:text-gray-300">
              Volume: {Math.round(options.volume * 100)}%
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-premium-gray-500">0%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={options.volume}
                onChange={(e) => updateOptions({ volume: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-premium-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-premium-gray-500">100%</span>
            </div>
          </div>

          {/* Reading Progress */}
          <div className="text-sm text-premium-gray-600 dark:text-gray-300">
            Woorden: {state.currentWord} van {state.totalWords}
          </div>
        </div>
      )}
    </div>
  );
};