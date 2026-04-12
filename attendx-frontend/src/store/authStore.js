import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  role: null,
  status: null,
  isLoading: true,
  loadingMessage: 'Checking authentication...',
  setUser: (user) => set({ user }),
  setProfile: (profile) =>
    set({
      profile,
      role: profile?.role ?? null,
      status: profile?.status ?? null,
    }),
  setLoading: (isLoading, loadingMessage = 'Loading...') => set({ isLoading, loadingMessage }),
  clearAuth: () =>
    set({
      user: null,
      profile: null,
      role: null,
      status: null,
      isLoading: false,
      loadingMessage: '',
    }),
}));

