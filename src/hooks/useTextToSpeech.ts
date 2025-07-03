import { useState, useEffect, useCallback, useRef } from 'react';

export interface TextToSpeechOptions {
  rate: number; // 0.5 to 2
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  voice: SpeechSynthesisVoice | null;
}

export interface TextToSpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  progress: number; // 0 to 100
  currentWord: number;
  totalWords: number;
  isSupported: boolean;
}

export const useTextToSpeech = () => {
  const [state, setState] = useState<TextToSpeechState>({
    isPlaying: false,
    isPaused: false,
    progress: 0,
    currentWord: 0,
    totalWords: 0,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  });

  const [options, setOptions] = useState<TextToSpeechOptions>({
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null,
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);

  // Load available voices
  useEffect(() => {
    if (!state.isSupported) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default Dutch voice if available, otherwise first available voice
      if (voices.length > 0 && !options.voice) {
        const dutchVoice = voices.find(voice => 
          voice.lang.startsWith('nl') || voice.lang.startsWith('en')
        );
        setOptions(prev => ({ ...prev, voice: dutchVoice || voices[0] }));
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [state.isSupported, options.voice]);

  const speak = useCallback((text: string) => {
    if (!state.isSupported || !text.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();

    // Clean and split text into words
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ');
    wordsRef.current = words;
    currentIndexRef.current = 0;

    setState(prev => ({ 
      ...prev, 
      totalWords: words.length,
      currentWord: 0,
      progress: 0 
    }));

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Configure utterance
    utterance.rate = options.rate;
    utterance.pitch = options.pitch;
    utterance.volume = options.volume;
    if (options.voice) {
      utterance.voice = options.voice;
    }

    // Event handlers
    utterance.onstart = () => {
      setState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    };

    utterance.onend = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isPaused: false,
        progress: 100,
        currentWord: prev.totalWords 
      }));
    };

    utterance.onerror = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isPaused: false 
      }));
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const wordsSpoken = Math.floor(event.charIndex / (cleanText.length / words.length));
        const progress = (wordsSpoken / words.length) * 100;
        
        setState(prev => ({
          ...prev,
          currentWord: wordsSpoken,
          progress: Math.min(progress, 100)
        }));
        
        currentIndexRef.current = wordsSpoken;
      }
    };

    speechSynthesis.speak(utterance);
  }, [state.isSupported, options]);

  const pause = useCallback(() => {
    if (!state.isSupported) return;
    
    speechSynthesis.pause();
    setState(prev => ({ ...prev, isPaused: true, isPlaying: false }));
  }, [state.isSupported]);

  const resume = useCallback(() => {
    if (!state.isSupported) return;
    
    speechSynthesis.resume();
    setState(prev => ({ ...prev, isPaused: false, isPlaying: true }));
  }, [state.isSupported]);

  const stop = useCallback(() => {
    if (!state.isSupported) return;
    
    speechSynthesis.cancel();
    setState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isPaused: false,
      progress: 0,
      currentWord: 0 
    }));
    currentIndexRef.current = 0;
  }, [state.isSupported]);

  const skipForward = useCallback(() => {
    if (!state.isSupported || !utteranceRef.current) return;
    
    // Skip 15 seconds worth of words (approximate)
    const wordsPerSecond = 3; // Average speaking rate
    const wordsToSkip = 15 * wordsPerSecond;
    const newIndex = Math.min(
      currentIndexRef.current + wordsToSkip, 
      wordsRef.current.length - 1
    );
    
    // Restart from new position
    const remainingText = wordsRef.current.slice(newIndex).join(' ');
    if (remainingText.trim()) {
      speechSynthesis.cancel();
      speak(remainingText);
    }
  }, [state.isSupported, speak]);

  const skipBackward = useCallback(() => {
    if (!state.isSupported || !utteranceRef.current) return;
    
    const wordsPerSecond = 3;
    const wordsToSkip = 15 * wordsPerSecond;
    const newIndex = Math.max(currentIndexRef.current - wordsToSkip, 0);
    
    const textFromNewPosition = wordsRef.current.slice(newIndex).join(' ');
    if (textFromNewPosition.trim()) {
      speechSynthesis.cancel();
      speak(textFromNewPosition);
    }
  }, [state.isSupported, speak]);

  const updateOptions = useCallback((newOptions: Partial<TextToSpeechOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        speechSynthesis.cancel();
      }
    };
  }, []);

  return {
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
  };
};