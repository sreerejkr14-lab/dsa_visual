import { useSyncExternalStore } from 'react';
import { getProgress, subscribe, type ProgressData } from './Progress';

/** Live progress data. Any component using this re-renders when progress changes. */
export function useProgress(): ProgressData {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}