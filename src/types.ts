export interface User {
  id: number;
  role: 'teacher' | 'admin';
  name: string;
  surname?: string;
  ai_key?: string;
  school?: string;
  position?: string;
}

export interface Teacher {
  id: number;
  citizen_id: string;
  name: string;
  surname: string;
  school: string;
  position: string;
  status: 'pending' | 'active' | 'rejected';
  role: 'teacher' | 'admin';
  login_count?: number;
  last_login?: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  level: string;
  weekly_hours: number;
  color?: string;
}

export interface ClassGrade {
  id: number;
  name: string;
  level: string;
  main_room_id?: number | null;
  room_name?: string;
}

export interface Room {
  id: number;
  name: string;
  type: string;
  capacity?: number;
}

export interface SystemSettings {
  id: number;
  school_name: string;
  academic_year: string;
  semester: string;
  periods_per_day: number;
  period_duration: number;
  start_time: string;
}

export interface FixedPeriod {
  id: number;
  activity_name: string;
  day_of_week: string;
  period_number: number;
  is_lunch_break: boolean;
}

export interface TeachingAssignment {
  id: number;
  teacher_id: number;
  teacher_name?: string;
  teacher_surname?: string;
  subject_id: number;
  subject_name?: string;
  subject_code?: string;
  class_id: number;
  class_name?: string;
  hours_per_week: number;
  is_double_period: boolean;
  main_room_id?: number;
  main_room_name?: string;
  backup_room_id?: number;
  backup_room_name?: string;
}

export interface ScheduleSlot {
  day: string; // Day name or index
  period: number;
  subjectId: number;
  teacherId: number;
  roomId?: number;
  isFixed?: boolean;
  activityName?: string;
}
