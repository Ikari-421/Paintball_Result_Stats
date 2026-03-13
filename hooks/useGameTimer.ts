import { useCallback, useEffect, useRef, useState } from "react";

export interface TimerState {
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
}

export const useGameTimer = (initialSeconds: number) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsRunning(true);
      setEndTimestamp(Date.now() + remainingSeconds * 1000);
    }
  }, [remainingSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setRemainingSeconds((prev) => {
      if (endTimestamp) return Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000));
      return prev;
    });
    setEndTimestamp(null);
  }, [endTimestamp]);

  const startNew = useCallback((seconds: number) => {
    setIsRunning(true);
    setRemainingSeconds(seconds);
    setEndTimestamp(Date.now() + seconds * 1000);
  }, []);

  const resume = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsRunning(true);
      setEndTimestamp(Date.now() + remainingSeconds * 1000);
    }
  }, [remainingSeconds]);

  const reset = useCallback((seconds?: number) => {
    setIsRunning(false);
    setEndTimestamp(null);
    setRemainingSeconds(seconds ?? initialSeconds);
  }, [initialSeconds]);

  const addTime = useCallback((seconds: number) => {
    setRemainingSeconds((prev) => Math.max(0, prev + seconds));
  }, []);

  const setTime = useCallback((seconds: number) => {
    setRemainingSeconds(Math.max(0, seconds));
    if (isRunning) {
      setEndTimestamp(Date.now() + Math.max(0, seconds) * 1000);
    }
  }, [isRunning]);

  const syncWithDB = useCallback((seconds: number, running: boolean, endTs: number | null) => {
    setIsRunning(running);
    setEndTimestamp(endTs);
    if (running && endTs) {
      setRemainingSeconds(Math.max(0, Math.ceil((endTs - Date.now()) / 1000)));
    } else {
      setRemainingSeconds(Math.max(0, seconds));
    }
  }, []);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (endTimestamp) {
            const calculatedRemaining = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000));
            if (calculatedRemaining <= 0) {
              setIsRunning(false);
              return 0;
            }
            return calculatedRemaining;
          }
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
  }, [isRunning, endTimestamp]); // CRITICAL: Removed remainingSeconds from dependencies

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
    stop,
    resume,
    reset,
    startNew,
    addTime,
    setTime,
    syncWithDB,
  };
};
