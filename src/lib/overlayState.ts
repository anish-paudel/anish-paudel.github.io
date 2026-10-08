import { useSyncExternalStore } from 'react';

// Reference-counted overlay registry. Any component mounted on top of the
// main scene calls `pushOverlay()` on mount and `popOverlay()` on unmount so
// the heavy Three.js background can pause its render loop while something is
// obscuring it.
let count = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function pushOverlay() {
  count++;
  if (count === 1) emit();
}

export function popOverlay() {
  count = Math.max(0, count - 1);
  if (count === 0) emit();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot() {
  return count > 0;
}

function getServerSnapshot() {
  return false;
}

export function useOverlayOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
