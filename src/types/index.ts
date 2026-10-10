export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rollNumber?: string;
  profileImage?: string;
  phone?: string;
  department?: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  profileImage?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  subject?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string | 'all';
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  teacher: string;
  room?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}
