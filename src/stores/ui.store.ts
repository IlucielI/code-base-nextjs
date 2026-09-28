import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface UiState {
  isSidebarOpen: boolean;
  activeModal: string | null;
}

export interface UiActions {
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  resetUi: () => void;
}

export type UiStore = UiState & UiActions;

const initialUiState: UiState = {
  isSidebarOpen: false,
  activeModal: null,
};

export const useUiStore = create<UiStore>()(
  devtools(
    (set) => ({
      ...initialUiState,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'ui/toggleSidebar'),
      setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }, false, 'ui/setSidebarOpen'),
      openModal: (modalId: string) => set({ activeModal: modalId }, false, 'ui/openModal'),
      closeModal: () => set({ activeModal: null }, false, 'ui/closeModal'),
      resetUi: () => set(initialUiState, false, 'ui/resetUi'),
    }),
    { name: 'UiStore' }
  )
);
