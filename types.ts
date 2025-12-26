
export interface TimeConfig {
  name: string;
  startTime: string;
  endTime: string;
}

export interface BaseConfig {
  differentSchedules: boolean;
  defaultStartTime: string;
  defaultEndTime: string;
  schedules: TimeConfig[];
  classDuration: number;
  snackDuration: number;
  lunchDuration: number;
  teachingDays: string[]; // ['Seg', 'Ter', ...]
}

export interface Room {
  id: string;
  name: string;
  type: 'regular' | 'lab' | 'sports' | 'library';
  capacity: number;
}

export interface Subject {
  id: string;
  name: string;
  type: 'theoretical' | 'practical' | 'lab';
  color: string;
}

export interface Group {
  id: string;
  name: string;
  level: string; // Fund I, Fund II, Médio
  shift: 'morning' | 'afternoon' | 'night';
  snackTime: string;
  lunchTime: string;
  scheduleId?: string; // Reference to specific schedule if differentSchedules is true
}

export interface TeacherRestriction {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjects: string[]; // subject IDs
  isFullyAvailable: boolean;
  restrictions: TeacherRestriction[];
}

export interface Workload {
  [groupId: string]: {
    [subjectId: string]: number;
  };
}

export interface AdvancedRules {
  avoidTeacherGaps: boolean;
  uniformDistribution: boolean;
  groupConsecutive: boolean;
  theoryEarly: boolean;
  balanceWorkload: boolean;
  labRule: 'avoidLast' | 'prioritizeEnd' | 'none';
  maxConsecutive: number;
}

export interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  groupId: string;
  roomId: string;
  subjectId: string;
  type: 'class' | 'snack' | 'lunch';
}

export type Step = 'config' | 'rooms' | 'subjects' | 'groups' | 'teachers' | 'workload' | 'rules' | 'generate' | 'result';
