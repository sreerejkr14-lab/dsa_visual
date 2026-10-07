import type { ElementState } from './algorithms';

export const stateColors: Record<ElementState, string> = {
  normal: 'var(--state-normal)',
  active: 'var(--state-active)',
  comparing: 'var(--state-comparing)',
  swapping: 'var(--state-swapping)',
  sorted: 'var(--state-sorted)',
  target: 'var(--state-target)',
  eliminated: 'var(--state-eliminated)',
  visited: 'var(--state-visited)',
  current: 'var(--state-current)',
  pivot: '#a855f7',
};