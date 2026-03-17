import { useRef, useEffect, useCallback } from 'react';
import { usePageVisibility } from './useVisibility';

interface AnimationFrameOptions {
  fps?: number;
  pauseWhenHidden?: boolean;
}

export function useAnimationFrame(
  callback: (deltaTime: number, elapsedTime: number) => void,
  options: AnimationFrameOptions = {}
) {
  const { fps = 60, pauseWhenHidden = true } = options;
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);
  const frameInterval = useRef<number>(1000 / fps);
  const isVisible = usePageVisibility();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current === 0) {
      previousTimeRef.current = time;
    }

    const deltaTime = time - previousTimeRef.current;

    if (deltaTime >= frameInterval.current) {
      previousTimeRef.current = time - (deltaTime % frameInterval.current);
      elapsedTimeRef.current += deltaTime;
      callback(deltaTime, elapsedTimeRef.current);
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [callback, frameInterval]);

  useEffect(() => {
    if (pauseWhenHidden && !isVisible) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, isVisible, pauseWhenHidden]);
}

// Hook for limiting frame rate
export function useFrameRateLimiter(targetFps: number = 30) {
  const frameInterval = useRef<number>(1000 / targetFps);
  const lastFrameTime = useRef<number>(0);

  return useCallback(() => {
    const now = performance.now();
    const elapsed = now - lastFrameTime.current;

    if (elapsed >= frameInterval.current) {
      lastFrameTime.current = now - (elapsed % frameInterval.current);
      return true;
    }
    return false;
  }, [targetFps]);
}
