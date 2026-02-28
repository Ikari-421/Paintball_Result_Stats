import { useEffect, useRef, useState } from "react";

export interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
}

export const useGameTimer = (initialSeconds: number) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (remainingSeconds > 0) {
      setIsRunning(true);
    }
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    if (remainingSeconds > 0) {
      setIsRunning(true);
    }
  };

  const reset = (seconds?: number) => {
    setIsRunning(false);
    setRemainingSeconds(seconds ?? initialSeconds);
  };

  const addTime = (seconds: number) => {
    setRemainingSeconds((prev) => Math.max(0, prev + seconds));
  };

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    remainingSeconds,
    isRunning,
    isFinished: remainingSeconds === 0,
    formattedTime: formatTime(remainingSeconds),
    start,
    pause,
    resume,
    reset,
    addTime,
  };
};
