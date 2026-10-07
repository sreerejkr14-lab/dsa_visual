import { useSyncExternalStore } from 'react';
import { getSyncStatus, subscribeSyncStatus, type SyncStatus } from './progressSync';

/** 'guest' | 'syncing' | 'synced' | 'error' */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus, getSyncStatus);
}