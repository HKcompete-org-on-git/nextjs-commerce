// lib/cache.ts
import * as nc from 'next/cache';

// Fallbacks for older Next versions that don't have cacheTag/cacheLife
type TagFn = (...tags: string[]) => void;
type LifeFn = (ttl?: unknown) => void;

export const cacheTag: TagFn =
  typeof (nc as any).cacheTag === 'function'
    ? (nc as any).cacheTag
    : typeof (nc as any).unstable_cacheTag === 'function'
      ? (nc as any).unstable_cacheTag
      : () => {};

export const cacheLife: LifeFn =
  typeof (nc as any).cacheLife === 'function'
    ? (nc as any).cacheLife
    : typeof (nc as any).unstable_cacheLife === 'function'
      ? (nc as any).unstable_cacheLife
      : () => {};
