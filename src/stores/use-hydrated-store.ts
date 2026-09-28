'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Custom hook to safely read persisted Zustand store states during SSR in Next.js.
 * Utilizes `useSyncExternalStore` with server and client snapshots to prevent hydration mismatches
 * without cascading `useEffect` renders.
 */
export function useHydratedStore<T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
): F | undefined {
  const result = store(callback) as F;
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return isHydrated ? result : undefined;
}
