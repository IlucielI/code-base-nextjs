import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useUiStore } from './ui.store';
import { useHydratedStore } from './use-hydrated-store';

describe('useHydratedStore', () => {
  it('returns the selected store value after mounting on client', () => {
    useUiStore.getState().setSidebarOpen(true);

    const { result } = renderHook(() =>
      useHydratedStore(useUiStore, (state) => state.isSidebarOpen)
    );

    expect(result.current).toBe(true);
  });
});
