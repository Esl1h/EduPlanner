
export const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const SUBJECT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#d946ef', '#ec4899'
];

export const SCHOOL_LEVELS = ['Fund. I', 'Fund. II', 'Médio'];
export const SHIFTS = [
  { value: 'morning', label: 'Manhã' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'night', label: 'Noite' }
];

export const INITIAL_BASE_CONFIG = {
  differentSchedules: false,
  defaultStartTime: '07:30',
  defaultEndTime: '12:30',
  schedules: [],
  classDuration: 50,
  snackDuration: 20,
  lunchDuration: 60,
  teachingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
};
