import { beforeEach, describe, expect, it } from 'vitest';
import { useUiStore } from './ui.store';

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.getState().resetUi();
  });

  it('should have correct default initial state', () => {
    const state = useUiStore.getState();
    expect(state.isSidebarOpen).toBe(false);
    expect(state.activeModal).toBeNull();
  });

  it('should toggle sidebar state', () => {
    const { toggleSidebar } = useUiStore.getState();

    toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(true);

    toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });

  it('should explicitly set sidebar open state', () => {
    const { setSidebarOpen } = useUiStore.getState();

    setSidebarOpen(true);
    expect(useUiStore.getState().isSidebarOpen).toBe(true);

    setSidebarOpen(false);
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });

  it('should open and close modal', () => {
    const { openModal, closeModal } = useUiStore.getState();

    openModal('auth-dialog');
    expect(useUiStore.getState().activeModal).toBe('auth-dialog');

    closeModal();
    expect(useUiStore.getState().activeModal).toBeNull();
  });

  it('should reset UI state to initial values', () => {
    const { setSidebarOpen, openModal, resetUi } = useUiStore.getState();

    setSidebarOpen(true);
    openModal('confirm-delete');

    expect(useUiStore.getState().isSidebarOpen).toBe(true);
    expect(useUiStore.getState().activeModal).toBe('confirm-delete');

    resetUi();

    expect(useUiStore.getState().isSidebarOpen).toBe(false);
    expect(useUiStore.getState().activeModal).toBeNull();
  });
});
