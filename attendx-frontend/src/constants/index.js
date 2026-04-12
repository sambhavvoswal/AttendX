export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const DEFAULT_ATTENDANCE_VALUES = [
  { label: 'Present', value: 'P', color: 'green', is_positive: true },
  { label: 'Absent', value: 'A', color: 'red', is_positive: false }
];

export const BADGE_THRESHOLDS = { green: 75, amber: 50 };
export const MAX_ATTENDANCE_VALUES = 8;
export const MIN_ATTENDANCE_VALUES = 2;
export const QR_LOGO_OPACITY_WARN = 75;
export const SCAN_DEBOUNCE_MS = 500;
export const STATUS_POLL_INTERVAL_MS = 30000;

export const COLOR_OPTIONS = [
  { name: 'green', hex: '#4ADE80' },
  { name: 'red', hex: '#F87171' },
  { name: 'amber', hex: '#F59E0B' },
  { name: 'blue', hex: '#60A5FA' },
  { name: 'slate', hex: '#94A3B8' },
  { name: 'coral', hex: '#F87060' },
  { name: 'violet', hex: '#A78BFA' },
  { name: 'teal', hex: '#2DD4BF' }
];

export const TAILWIND_SAFE_BG = {
  green: 'bg-[#4ADE80]',
  red: 'bg-[#F87171]',
  amber: 'bg-[#F59E0B]',
  blue: 'bg-[#60A5FA]',
  slate: 'bg-[#94A3B8]',
  coral: 'bg-[#F87060]',
  violet: 'bg-[#A78BFA]',
  teal: 'bg-[#2DD4BF]',
};
