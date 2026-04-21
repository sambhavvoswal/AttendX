import { create } from 'zustand';

export const useSheetStore = create((set) => ({
  sheets: [],
  recentSheets: [],
  activeSheet: null,
  students: [],
  studentsCacheId: null,
  columns: { all_headers: [], non_attendance: [], attendance_dates: [] },
  isLoading: false,
  error: null,
  
  setSheets: (sheets) => set({ sheets }),
  setRecentSheets: (recentSheets) => set({ recentSheets }),
  setActiveSheet: (sheet) => set({ activeSheet: sheet }),
  setStudents: (students, sheetId, columns) => set({ students, studentsCacheId: sheetId, columns }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
