import { useState, useEffect, useRef, useCallback } from "react";

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  autoRestart: boolean;
  soundEnabled: boolean;
}

export const useTimer = () => {
  const [state, setState] = useState<TimerState>({
    minutes: 30,
    seconds: 0,
    isRunning: false,
    autoRestart: true,
    soundEnabled: true,
  });

  const [timeLeft, setTimeLeft] = useState(state.minutes * 60 + state.seconds);
  const initialTime = useRef(state.minutes * 60 + state.seconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    // Fallback to web audio if file doesn't exist
    return () => {
      audioRef.current = null;
    };
  }, []);

  const playSound = useCallback(() => {
    if (!state.soundEnabled) return;
    
    // Try to play audio file, fallback to Web Audio API
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to Web Audio API beep
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
          audioContext.close();
        }, 500);
      });
    }
  }, [state.soundEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && state.isRunning) {
      playSound();
      
      if (state.autoRestart) {
        setTimeLeft(initialTime.current);
      } else {
        setState((prev) => ({ ...prev, isRunning: false }));
      }
    }

    return () => clearInterval(interval);
  }, [state.isRunning, timeLeft, state.autoRestart, playSound]);

  const start = () => {
    initialTime.current = state.minutes * 60 + state.seconds;
    setTimeLeft(initialTime.current);
    setState((prev) => ({ ...prev, isRunning: true }));
  };

  const pause = () => {
    setState((prev) => ({ ...prev, isRunning: false }));
  };

  const resume = () => {
    setState((prev) => ({ ...prev, isRunning: true }));
  };

  const reset = () => {
    setTimeLeft(initialTime.current);
    setState((prev) => ({ ...prev, isRunning: false }));
  };

  const setMinutes = (minutes: number) => {
    setState((prev) => ({ ...prev, minutes }));
    if (!state.isRunning) {
      setTimeLeft(minutes * 60 + state.seconds);
      initialTime.current = minutes * 60 + state.seconds;
    }
  };

  const setSeconds = (seconds: number) => {
    setState((prev) => ({ ...prev, seconds }));
    if (!state.isRunning) {
      setTimeLeft(state.minutes * 60 + seconds);
      initialTime.current = state.minutes * 60 + seconds;
    }
  };

  const toggleAutoRestart = () => {
    setState((prev) => ({ ...prev, autoRestart: !prev.autoRestart }));
  };

  const toggleSound = () => {
    setState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;

  return {
    ...state,
    timeLeft,
    displayMinutes,
    displaySeconds,
    start,
    pause,
    resume,
    reset,
    setMinutes,
    setSeconds,
    toggleAutoRestart,
    toggleSound,
  };
};
