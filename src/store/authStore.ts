import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, UserRole } from '@/types';

// Generate student roll numbers from 242P1A0501 to 242P1A0560
const generateStudentCredentials = () => {
  const students: Record<string, { password: string; name: string }> = {};
  for (let i = 1; i <= 60; i++) {
    const num = i.toString().padStart(2, '0');
    const rollNumber = `242P1A05${num}`;
    students[`${rollNumber}@cbit.edu.in`.toLowerCase()] = {
      password: rollNumber,
      name: `Student ${num}`,
    };
  }
  return students;
};

// Teacher credentials
const teacherCredentials: Record<string, { password: string; name: string }> = {
  'narashima@cbit.edu.in': { password: 'NARASHIMA', name: 'Dr. Narashima' },
  'ramireddy@cbit.edu.in': { password: 'RAMIREDDY', name: 'Prof. Ramireddy' },
  'pavani@cbit.edu.in': { password: 'PAVANI', name: 'Dr. Pavani' },
  'suresh@cbit.edu.in': { password: 'SURESH', name: 'Prof. Suresh' },
  'priya@cbit.edu.in': { password: 'PRIYA', name: 'Dr. Priya' },
};

const studentCredentials = generateStudentCredentials();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password: string, role: UserRole): boolean => {
        const emailLower = email.toLowerCase();
        
        if (role === 'teacher') {
          const teacher = teacherCredentials[emailLower];
          if (teacher && teacher.password === password) {
            const user: User = {
              id: emailLower,
              email: emailLower,
              name: teacher.name,
              role: 'teacher',
              department: 'Computer Science',
            };
            set({ user, isAuthenticated: true });
            return true;
          }
        } else {
          const student = studentCredentials[emailLower];
          if (student && student.password === password) {
            const rollNumber = emailLower.replace('@cbit.edu.in', '').toUpperCase();
            const user: User = {
              id: emailLower,
              email: emailLower,
              name: student.name,
              role: 'student',
              rollNumber,
              department: 'Computer Science',
            };
            set({ user, isAuthenticated: true });
            return true;
          }
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
