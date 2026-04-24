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
  subjects?: string[]; // IDs of subjects they can teach
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  weeklyHours: number;
  color?: string;
  suitableTeachers: number[]; // Teacher IDs
}

export interface ClassGrade {
  id: string;
  level: string; // e.g., Grade 1
  room: string;  // e.g., Room 101 or 1/1
  studentCount?: number;
}

export interface Room {
  id: string;
  name: string;
  capacity?: number;
  type?: 'regular' | 'lab' | 'sport';
}

export interface ScheduleSlot {
  day: number; // 0=Monday, 4=Friday
  period: number; // 1-8
  subjectId: string;
  teacherId: number;
  roomId?: string;
}

export interface ClassSchedule {
  classId: string;
  slots: ScheduleSlot[];
}
