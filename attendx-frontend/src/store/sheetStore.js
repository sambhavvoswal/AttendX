import { create } from 'zustand';

export const useSheetStore = create((set) => ({
  sheets: [],
  recentSheets: [],
  activeSheet: null,
  students: [],
  isLoading: false,
  error: null,
  
  setSheets: (sheets) => set({ sheets }),
  setRecentSheets: (recentSheets) => set({ recentSheets }),
  setActiveSheet: (sheet) => set({ activeSheet: sheet }),
  setStudents: (students) => set({ students }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
