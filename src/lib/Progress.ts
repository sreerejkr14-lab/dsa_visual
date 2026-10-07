/**
 * DSAViz progress tracking.
 *
 * Everything here is plain TypeScript (no React), so the logic can be unit tested on its own.
 * Data lives in localStorage today. To sync with a backend later, only `load` / `save` below
 * need to change: the rest of the app talks to the store through the functions at the bottom.
 */

export interface ProgressData {
  version: 1;
  /** algorithm id -> how often it was opened */
  visits: Record<string, { count: number; first: string; last: string }>;
  /** algorithm id -> ISO time it was first played through to the last step */
  completed: Record<string, string>;
  favorites: string[];
  /** challenge id (as string) -> result of the first correct solve */
  challenges: Record<string, { points: number; seconds: number; attempts: number; solvedAt: string }>;
  /** local calendar day (YYYY-MM-DD) -> number of learning actions that day */
  activity: Record<string, number>;
}

export const STORAGE_KEY = 'dsaviz:progress:v1';

export const emptyProgress = (): ProgressData => ({
  version: 1,
  visits: {},
  completed: {},
  favorites: [],
  challenges: {},
  activity: {},
});

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day, e.g. "2026-09-20". */
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Shift a day key by whole days. Uses noon so daylight-saving changes can't skip or repeat a day. */
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  date.setDate(date.getDate() + n);
  return dayKey(date);
}

export function timeAgo(iso: string, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ------------------------------------------------------------------ */
/* Pure updates (each returns a new object, nothing is mutated)        */
/* ------------------------------------------------------------------ */

const bumpActivity = (activity: ProgressData['activity'], now: Date) => {
  const key = dayKey(now);
  return { ...activity, [key]: (activity[key] ?? 0) + 1 };
};

export function withVisit(p: ProgressData, id: string, now: Date): ProgressData {
  const prev = p.visits[id];
  const iso = now.toISOString();
  return {
    ...p,
    visits: { ...p.visits, [id]: { count: (prev?.count ?? 0) + 1, first: prev?.first ?? iso, last: iso } },
    activity: bumpActivity(p.activity, now),
  };
}

export function withCompleted(p: ProgressData, id: string, now: Date): ProgressData {
  if (p.completed[id]) return p; // only the first completion counts
  return { ...p, completed: { ...p.completed, [id]: now.toISOString() }, activity: bumpActivity(p.activity, now) };
}

export function withFavoriteToggled(p: ProgressData, id: string): ProgressData {
  return {
    ...p,
    favorites: p.favorites.includes(id) ? p.favorites.filter((f) => f !== id) : [...p.favorites, id],
  };
}

export function withChallengeSolved(
  p: ProgressData,
  id: number,
  points: number,
  seconds: number,
  attempts: number,
  now: Date
): ProgressData {
  if (p.challenges[String(id)]) return p; // points are awarded once
  return {
    ...p,
    challenges: { ...p.challenges, [String(id)]: { points, seconds, attempts, solvedAt: now.toISOString() } },
    activity: bumpActivity(p.activity, now),
  };
}

/* ------------------------------------------------------------------ */
/* Derived numbers for the Progress page                               */
/* ------------------------------------------------------------------ */

export const totalPoints = (p: ProgressData) =>
  Object.values(p.challenges).reduce((sum, c) => sum + c.points, 0);

/** Current streak counts back from today, or from yesterday if you haven't studied yet today. */
export function streakInfo(activity: ProgressData['activity'], today: string) {
  const active = (k: string) => (activity[k] ?? 0) > 0;

  let current = 0;
  let cursor = active(today) ? today : addDays(today, -1);
  while (active(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  const days = Object.keys(activity).filter(active).sort();
  let longest = 0;
  let run = 0;
  days.forEach((d, i) => {
    run = i > 0 && addDays(days[i - 1], 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
  });

  return { current, longest };
}

/** The last `n` days, oldest first, ending today. */
export function lastNDays(activity: ProgressData['activity'], n: number, today: string) {
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i - (n - 1));
    return { date, count: activity[date] ?? 0 };
  });
}

export function categoryProgress(
  p: ProgressData,
  algorithms: { id: string; category: string }[],
  categories: string[]
) {
  return categories.map((name) => {
    const inCat = algorithms.filter((a) => a.category === name);
    return { name, done: inCat.filter((a) => p.completed[a.id]).length, total: inCat.length };
  });
}

/** Most recently opened algorithms, newest first. */
export function recentVisits(p: ProgressData, limit: number) {
  return Object.entries(p.visits)
    .sort((a, b) => (a[1].last < b[1].last ? 1 : -1))
    .slice(0, limit)
    .map(([id, v]) => ({ id, last: v.last }));
}

/* ------------------------------------------------------------------ */
/* Merging two copies (e.g. a guest's browser data + the saved account) */
/* ------------------------------------------------------------------ */

const earlier = (a: string, b: string) => (Date.parse(a) <= Date.parse(b) ? a : b);
const later = (a: string, b: string) => (Date.parse(a) >= Date.parse(b) ? a : b);

/**
 * Union of two progress records: nothing either side earned is lost.
 * Counts use the larger value (summing would double count data that was already merged once).
 */
export function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  const out = emptyProgress();

  for (const id of new Set([...Object.keys(a.visits), ...Object.keys(b.visits)])) {
    const x = a.visits[id];
    const y = b.visits[id];
    out.visits[id] =
      x && y
        ? { count: Math.max(x.count, y.count), first: earlier(x.first, y.first), last: later(x.last, y.last) }
        : { ...(x ?? y) };
  }

  for (const id of new Set([...Object.keys(a.completed), ...Object.keys(b.completed)])) {
    const x = a.completed[id];
    const y = b.completed[id];
    out.completed[id] = x && y ? earlier(x, y) : (x ?? y);
  }

  out.favorites = [...new Set([...a.favorites, ...b.favorites])];

  for (const id of new Set([...Object.keys(a.challenges), ...Object.keys(b.challenges)])) {
    const x = a.challenges[id];
    const y = b.challenges[id];
    out.challenges[id] = x && y ? { ...(earlier(x.solvedAt, y.solvedAt) === x.solvedAt ? x : y) } : { ...(x ?? y) };
  }

  for (const day of new Set([...Object.keys(a.activity), ...Object.keys(b.activity)])) {
    out.activity[day] = Math.max(a.activity[day] ?? 0, b.activity[day] ?? 0);
  }

  return out;
}

const canonical = (v: unknown): string =>
  JSON.stringify(v, (_k, val) =>
    isRecord(val) ? Object.fromEntries(Object.entries(val).sort(([x], [y]) => (x < y ? -1 : 1))) : val
  );

/** Deep equality that ignores key order. */
export const progressEqual = (a: ProgressData, b: ProgressData) => canonical(a) === canonical(b);

/* ------------------------------------------------------------------ */
/* Loading, validating and saving                                      */
/* ------------------------------------------------------------------ */

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Accepts anything, returns valid progress data. Corrupt or hand-edited storage never crashes the app. */
export function sanitize(raw: unknown): ProgressData {
  const out = emptyProgress();
  if (!isRecord(raw)) return out;

  if (isRecord(raw.visits)) {
    for (const [id, v] of Object.entries(raw.visits)) {
      if (isRecord(v) && isNum(v.count) && typeof v.first === 'string' && typeof v.last === 'string') {
        out.visits[id] = { count: v.count, first: v.first, last: v.last };
      }
    }
  }
  if (isRecord(raw.completed)) {
    for (const [id, t] of Object.entries(raw.completed)) if (typeof t === 'string') out.completed[id] = t;
  }
  if (Array.isArray(raw.favorites)) {
    out.favorites = [...new Set(raw.favorites.filter((f): f is string => typeof f === 'string'))];
  }
  if (isRecord(raw.challenges)) {
    for (const [id, c] of Object.entries(raw.challenges)) {
      if (isRecord(c) && isNum(c.points) && isNum(c.seconds) && isNum(c.attempts) && typeof c.solvedAt === 'string') {
        out.challenges[id] = { points: c.points, seconds: c.seconds, attempts: c.attempts, solvedAt: c.solvedAt };
      }
    }
  }
  if (isRecord(raw.activity)) {
    for (const [day, n] of Object.entries(raw.activity)) if (isNum(n) && n > 0) out.activity[day] = n;
  }
  return out;
}

function load(): ProgressData {
  try {
    const text = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return text ? sanitize(JSON.parse(text)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function save(p: ProgressData) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage full or blocked (e.g. private mode): progress just won't persist */
  }
}

/* ------------------------------------------------------------------ */
/* Sync bookkeeping: whose data is cached here, and is it saved?        */
/* ------------------------------------------------------------------ */

export const OWNER_KEY = 'dsaviz:progress:owner';
export const DIRTY_KEY = 'dsaviz:progress:dirty';

function readKey(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeKey(key: string, value: string | null) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/** The account whose progress is cached in this browser, or null for a guest. */
export const getOwner = () => readKey(OWNER_KEY);
export const setOwner = (id: string | null) => writeKey(OWNER_KEY, id);

/** True while the local copy has changes that haven't reached the server yet. */
export const getDirty = () => readKey(DIRTY_KEY) === '1';
export const setDirty = (dirty: boolean) => writeKey(DIRTY_KEY, dirty ? '1' : null);

/* ------------------------------------------------------------------ */
/* The store                                                           */
/* ------------------------------------------------------------------ */

let state: ProgressData = load();
const listeners = new Set<() => void>();

type ChangeSource = 'local' | 'remote';
const changeListeners = new Set<(source: ChangeSource) => void>();

function commit(next: ProgressData, source: ChangeSource = 'local') {
  if (next === state) return; // nothing changed
  state = next;
  save(state);
  listeners.forEach((l) => l());
  changeListeners.forEach((l) => l(source));
}

/** Called after every change. `source` says whether the user did it or the sync layer loaded it. */
export function onProgressChange(listener: (source: ChangeSource) => void) {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

/** Replace everything with data that came from the server (or an empty state). Not treated as a user change. */
export function replaceProgress(next: ProgressData) {
  if (progressEqual(next, state)) return;
  commit(next, 'remote');
}

export const getProgress = () => state;

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Keep several open tabs in step with each other.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      state = load();
      listeners.forEach((l) => l());
    }
  });
}

export const markVisited = (id: string) => commit(withVisit(state, id, new Date()));
export const markCompleted = (id: string) => commit(withCompleted(state, id, new Date()));
export const toggleFavorite = (id: string) => commit(withFavoriteToggled(state, id));
export const recordChallengeSolved = (id: number, points: number, seconds: number, attempts: number) =>
  commit(withChallengeSolved(state, id, points, seconds, attempts, new Date()));
export const resetProgress = () => commit(emptyProgress());