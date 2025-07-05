import { useState, useEffect } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTTS } from '@/hooks/useTTS';

interface AudioPlayerProps {
  text: string;
  title: string;
  className?: string;
}

export const AudioPlayer = ({ text, title, className = '' }: AudioPlayerProps) => {
  const {
    isLoading,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    error,
    speak,
    pause,
    resume,
    stop,
    setSpeed,
    setVolume,
    skipForward,
    skipBackward
  } = useTTS();

  const [speed, setSpeedState] = useState(0.9);
  const [volume, setVolumeState] = useState(0.8);

  useEffect(() => {
    setSpeed(speed);
  }, [speed, setSpeed]);

  useEffect(() => {
    setVolume(volume);
  }, [volume, setVolume]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (isPaused) {
      resume();
    } else {
      speak(text, { speed });
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-az-red" />
          <span className="font-medium text-az-black dark:text-white">Audio Artikel</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-az-black dark:text-gray-300 mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="w-full bg-premium-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-az-red h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button
          onClick={skipBackward}
          disabled={!isPlaying && !isPaused}
          variant="ghost"
          size="sm"
          className="text-az-red hover:bg-az-red/10 hover:text-az-red"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          onClick={isPlaying ? pause : handlePlay}
          disabled={isLoading}
          variant="default"
          size="sm"
          className="bg-az-red hover:bg-red-700 text-white px-6"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          variant="ghost"
          size="sm"
          className="text-az-red hover:bg-az-red/10 hover:text-az-red"
        >
          <Square className="w-4 h-4" />
        </Button>

        <Button
          onClick={skipForward}
          disabled={!isPlaying && !isPaused}
          variant="ghost"
          size="sm"
          className="text-az-red hover:bg-az-red/10 hover:text-az-red"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Speed and Volume Controls */}
      <div className="flex items-center gap-6 text-sm">
        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-az-black dark:text-gray-300 min-w-fit">Snelheid:</span>
          <div className="relative">
            <Select value={speed.toString()} onValueChange={(value) => setSpeedState(Number(value))}>
              <SelectTrigger className="w-20 bg-az-red text-white border-az-red hover:bg-red-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-premium-gray-200 dark:border-gray-700">
                <SelectItem value="0.75" className="hover:bg-az-red/10 focus:bg-az-red/10">0.75x</SelectItem>
                <SelectItem value="0.9" className="hover:bg-az-red/10 focus:bg-az-red/10">0.9x</SelectItem>
                <SelectItem value="1" className="hover:bg-az-red/10 focus:bg-az-red/10">1x</SelectItem>
                <SelectItem value="1.25" className="hover:bg-az-red/10 focus:bg-az-red/10">1.25x</SelectItem>
                <SelectItem value="1.5" className="hover:bg-az-red/10 focus:bg-az-red/10">1.5x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="w-4 h-4 text-az-red" />
          <div className="flex-1">
            <Slider
              value={[volume]}
              onValueChange={(values) => setVolumeState(values[0])}
              max={1}
              min={0}
              step={0.1}
              className="flex-1 audio-slider"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading Text */}
      {isLoading && (
        <div className="mt-3 text-center text-sm text-az-black dark:text-gray-400">
          Audio wordt gegenereerd...
        </div>
      )}
    </div>
  );
};