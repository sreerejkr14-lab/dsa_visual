/**
 * Keeps the browser's progress and the user's saved account progress in step.
 *
 * Rules that keep data safe:
 *  1. Nothing is sent to the server until the server's copy has been read successfully,
 *     so a fresh device can never overwrite an existing account with an empty state.
 *  2. First login on a browser (or a browser with unsaved changes): MERGE both copies, nothing is lost.
 *  3. Returning to a browser whose copy was fully saved: ADOPT the server's copy, so things you
 *     removed on another device (like a favourite) stay removed.
 *  4. Changes are saved a moment after you stop clicking, retried if the network fails,
 *     and flushed when the tab is hidden.
 *
 * This file knows nothing about Supabase. It talks to a `RemoteStore`, which makes it testable.
 */

import {
  emptyProgress,
  getDirty,
  getOwner,
  getProgress,
  mergeProgress,
  onProgressChange,
  progressEqual,
  replaceProgress,
  sanitize,
  setDirty,
  setOwner,
  type ProgressData,
} from './Progress';

export interface RemoteStore {
  /** Returns the saved progress, or null if this user has none yet. Throws on network/server errors. */
  load(userId: string): Promise<unknown | null>;
  /** Saves the full progress. Throws on network/server errors. */
  save(userId: string, data: ProgressData): Promise<void>;
}

export type SyncStatus = 'guest' | 'syncing' | 'synced' | 'error';

const options = { debounceMs: 1500, retryMs: 10_000, refreshMinMs: 30_000 };

let remote: RemoteStore | null = null;
let current: string | null = null; // user being synced, null when logged out
let generation = 0; // bumped on start/stop so late async results from an old session are ignored
let initialised = false; // true once the server copy has been read successfully
let dirty = false;
let status: SyncStatus = 'guest';
let lastRefresh = 0;

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let chain: Promise<unknown> = Promise.resolve();
let detach: (() => void) | null = null;

const statusListeners = new Set<() => void>();

function setStatus(next: SyncStatus) {
  if (status === next) return;
  status = next;
  statusListeners.forEach((l) => l());
}

export const getSyncStatus = () => status;
export function subscribeSyncStatus(listener: () => void) {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

export function configureSync(store: RemoteStore | null, overrides: Partial<typeof options> = {}) {
  remote = store;
  Object.assign(options, overrides);
}

/* ------------------------------------------------------------------ */
/* Saving                                                              */
/* ------------------------------------------------------------------ */

function markDirty() {
  dirty = true;
  setDirty(true); // remembered across reloads, so unsaved work is merged (not overwritten) next time
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void flush(), options.debounceMs);
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  const gen = generation;
  retryTimer = setTimeout(() => {
    if (gen !== generation || !current) return;
    if (!initialised) void initialSync(current, gen);
    else void flush();
  }, options.retryMs);
}

async function doFlush(): Promise<boolean> {
  if (!remote || !current || !initialised) return false;
  clearTimeout(saveTimer);
  if (!dirty) return true;

  const gen = generation;
  const user = current;
  const snapshot = getProgress();
  setStatus('syncing');

  let ok = true;
  try {
    await remote.save(user, snapshot);
  } catch {
    ok = false;
  }
  if (gen !== generation) return ok; // logged out or switched user while saving

  if (!ok) {
    setStatus('error');
    scheduleRetry();
    return false;
  }
  if (getProgress() === snapshot) {
    dirty = false;
    setDirty(false);
    setStatus('synced');
  } else {
    scheduleSave(); // more changes arrived while we were saving
  }
  return true;
}

/** Saves run one at a time, in order. */
function flush(): Promise<boolean> {
  const next = chain.then(doFlush, doFlush);
  chain = next;
  return next;
}

/** Save now if anything is unsaved. Resolves false if it could not be saved. */
export async function flushNow(): Promise<boolean> {
  if (!current) return true;
  if (!initialised) return !dirty;
  return dirty ? flush() : true;
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

async function initialSync(userId: string, gen: number): Promise<void> {
  if (!remote) return;
  let raw: unknown;
  try {
    raw = await remote.load(userId);
  } catch {
    if (gen !== generation) return;
    setStatus('error');
    scheduleRetry(); // keep working locally; try to read the server again later
    return;
  }
  if (gen !== generation) return;

  const remoteData = raw == null ? null : sanitize(raw);
  const local = getProgress();
  const cacheIsClean = getOwner() === userId && !getDirty() && !dirty;

  let next: ProgressData;
  if (!remoteData) next = local; // nothing saved yet: our copy becomes the account's copy
  else if (cacheIsClean) next = remoteData; // fully saved earlier: the server is the truth
  else next = mergeProgress(local, remoteData); // guest data or unsaved changes: keep everything

  replaceProgress(next);
  setOwner(userId);
  initialised = true;

  if (!remoteData || !progressEqual(next, remoteData)) {
    markDirty();
    await flush();
  } else {
    dirty = false;
    setDirty(false);
    setStatus('synced');
  }
}

/** Pull the latest server copy (used when you come back to the tab). */
export async function refreshNow(): Promise<void> {
  if (!remote || !current || !initialised) return;
  const gen = generation;
  const user = current;
  lastRefresh = Date.now();

  let raw: unknown;
  try {
    raw = await remote.load(user);
  } catch {
    if (gen === generation) setStatus('error');
    return;
  }
  if (gen !== generation) return;

  if (raw != null) {
    const remoteData = sanitize(raw);
    // Unsaved local changes are merged in; otherwise the server copy simply wins.
    replaceProgress(dirty ? mergeProgress(getProgress(), remoteData) : remoteData);
  }
  if (dirty) await flush();
  else setStatus('synced');
}

/* ------------------------------------------------------------------ */
/* Start / stop                                                        */
/* ------------------------------------------------------------------ */

function attach() {
  const offChanges = onProgressChange((source) => {
    if (source !== 'local') return;
    markDirty();
    if (initialised) scheduleSave();
  });

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      if (dirty) void flush();
    } else if (Date.now() - lastRefresh > options.refreshMinMs) {
      void (dirty ? flush() : refreshNow());
    }
  };
  const onOnline = () => void (dirty ? flush() : refreshNow());

  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);
  if (typeof window !== 'undefined') window.addEventListener('online', onOnline);

  detach = () => {
    offChanges();
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    if (typeof window !== 'undefined') window.removeEventListener('online', onOnline);
  };
}

function teardown() {
  clearTimeout(saveTimer);
  clearTimeout(retryTimer);
  detach?.();
  detach = null;
}

export async function startSync(userId: string): Promise<void> {
  if (!remote) return;
  if (current === userId) return; // already running (React StrictMode runs effects twice in dev)

  teardown();
  const gen = ++generation;
  current = userId;
  initialised = false;
  dirty = false;
  setStatus('syncing');

  // Cached progress that belongs to a different account must never leak into this one.
  const owner = getOwner();
  if (owner !== null && owner !== userId) {
    replaceProgress(emptyProgress());
    setOwner(null);
    setDirty(false);
  }

  attach();
  await initialSync(userId, gen);
}

export async function stopSync(): Promise<void> {
  if (current === null) {
    // Sync never started in this page load. A leftover cache from a signed-out account
    // must not be shown to the next visitor, but a plain guest's data must be left alone.
    if (getOwner() !== null) {
      replaceProgress(emptyProgress());
      setOwner(null);
      setDirty(false);
    }
    return;
  }

  teardown();
  generation++;
  current = null;
  initialised = false;
  dirty = false;
  setDirty(false);
  setOwner(null);
  replaceProgress(emptyProgress());
  setStatus('guest');
}