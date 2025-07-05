import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TTSOptions {
  voice?: string;
  speed?: number;
}

interface TTSState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
}

export const useTTS = () => {
  const [state, setState] = useState<TTSState>({
    isLoading: false,
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    error: null
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef(0);

  const createAudioFromBase64 = useCallback((base64Audio: string) => {
    const audioBlob = new Blob([
      Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))
    ], { type: 'audio/mp3' });
    return URL.createObjectURL(audioBlob);
  }, []);

  const playNextChunk = useCallback(() => {
    if (currentChunkRef.current < audioChunksRef.current.length) {
      const audioUrl = createAudioFromBase64(audioChunksRef.current[currentChunkRef.current]);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(console.error);
      }
    } else {
      // All chunks played
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
        currentTime: 0
      }));
    }
  }, [createAudioFromBase64]);

  const speak = useCallback(async (text: string, options: TTSOptions = {}) => {
    try {
      // Pre-initialize audio element within user gesture for mobile compatibility
      if (!audioRef.current) {
        audioRef.current = new Audio();
        
        // Create a silent audio blob to establish audio context
        const silentBlob = new Blob([new Uint8Array([])], { type: 'audio/mp3' });
        const silentUrl = URL.createObjectURL(silentBlob);
        audioRef.current.src = silentUrl;
        
        // Try to play (and immediately pause) to unlock audio context on mobile
        try {
          await audioRef.current.play();
          audioRef.current.pause();
        } catch (e) {
          console.log('Audio context unlock attempt:', e);
        }
        
        audioRef.current.addEventListener('ended', () => {
          currentChunkRef.current++;
          playNextChunk();
        });

        audioRef.current.addEventListener('timeupdate', () => {
          setState(prev => ({
            ...prev,
            currentTime: audioRef.current?.currentTime || 0
          }));
        });

        audioRef.current.addEventListener('loadedmetadata', () => {
          setState(prev => ({
            ...prev,
            duration: audioRef.current?.duration || 0
          }));
        });
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null 
      }));

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: 'nl-NL-Standard-B', // Fixed male voice
          speed: options.speed || 0.9
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error);
      }

      audioChunksRef.current = data.audioChunks;
      currentChunkRef.current = 0;

      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: true
      }));

      playNextChunk();

    } catch (error) {
      console.error('TTS Error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'TTS failed'
      }));
    }
  }, [playNextChunk]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: true
      }));
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setState(prev => ({
        ...prev,
        isPlaying: true,
        isPaused: false
      }));
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    currentChunkRef.current = 0;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentTime: 0
    }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 15
      );
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    setSpeed,
    setVolume,
    skipForward,
    skipBackward
  };
};