import { useState, useEffect, useRef, useCallback } from 'react';
import { useThrottle } from './useThrottle';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export function useMousePosition(throttleMs = 16): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({
      x: e.clientX,
      y: e.clientY,
      normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
      normalizedY: -(e.clientY / window.innerHeight) * 2 + 1,
    });
  }, []);

  const throttledHandleMouseMove = useThrottle(handleMouseMove, throttleMs);

  useEffect(() => {
    window.addEventListener('mousemove', throttledHandleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', throttledHandleMouseMove);
  }, [throttledHandleMouseMove]);

  return position;
}

// Global mouse position singleton for sharing across components
let globalMousePosition: MousePosition = {
  x: 0,
  y: 0,
  normalizedX: 0,
  normalizedY: 0,
};

let listeners: ((pos: MousePosition) => void)[] = [];
let isInitialized = false;

export function useGlobalMousePosition(): MousePosition {
  const [position, setPosition] = useState(globalMousePosition);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
      
      const handleMouseMove = (e: MouseEvent) => {
        if (rafRef.current) return;
        
        rafRef.current = requestAnimationFrame(() => {
          globalMousePosition = {
            x: e.clientX,
            y: e.clientY,
            normalizedX: (e.clientX / window.innerWidth) * 2 - 1,
            normalizedY: -(e.clientY / window.innerHeight) * 2 + 1,
          };
          listeners.forEach(cb => cb(globalMousePosition));
          rafRef.current = null;
        });
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const callback = (pos: MousePosition) => setPosition(pos);
    listeners.push(callback);

    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  }, []);

  return position;
}
