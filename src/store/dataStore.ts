import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, AttendanceRecord, Message, TimetableEntry } from '@/types';

// Generate initial students
const generateInitialStudents = (): Student[] => {
  const students: Student[] = [];
  const names = [
    'Aditya Kumar', 'Bhavya Sharma', 'Chandra Prakash', 'Deepika Reddy', 'Eswar Rao',
    'Farhan Ahmed', 'Gita Patel', 'Harish Iyer', 'Indira Menon', 'Jayesh Nair',
    'Kavitha Sundaram', 'Lakshmi Devi', 'Manoj Tiwari', 'Neha Gupta', 'Om Prakash',
    'Priya Verma', 'Qureshi Hassan', 'Rahul Singh', 'Sneha Kapoor', 'Tanvi Joshi',
    'Uma Shankar', 'Vijay Krishna', 'Waqar Ali', 'Xavier Joseph', 'Yamini Rao',
    'Zara Sheikh', 'Arjun Menon', 'Bharat Kumar', 'Chandni Agarwal', 'Dhruv Patel',
    'Esha Mishra', 'Firoz Khan', 'Gaurav Sinha', 'Heena Begum', 'Ishaan Sharma',
    'Jaya Lakshmi', 'Karthik Rajan', 'Lata Kumari', 'Mohan Das', 'Nandini Rao',
    'Omkar Joshi', 'Pooja Sharma', 'Qadir Basha', 'Ravi Shankar', 'Sunita Devi',
    'Tarun Agarwal', 'Usha Rani', 'Varun Mehta', 'Waseem Akram', 'Yash Patel',
    'Zoya Ansari', 'Akhil Reddy', 'Bindu Priya', 'Chetan Kumar', 'Divya Rani',
    'Eshwar Prasad', 'Farheen Banu', 'Ganesh Kumar', 'Hema Latha', 'Irfan Sheikh',
  ];

  for (let i = 1; i <= 60; i++) {
    const num = i.toString().padStart(2, '0');
    const rollNumber = `242P1A05${num}`;
    students.push({
      id: rollNumber,
      rollNumber,
      name: names[i - 1] || `Student ${num}`,
      email: `${rollNumber.toLowerCase()}@cbit.edu.in`,
      department: 'Computer Science',
    });
  }
  return students;
};

// Generate sample attendance records
const generateSampleAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const subjects = ['Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'Web Development'];
  
  for (let i = 1; i <= 60; i++) {
    const num = i.toString().padStart(2, '0');
    const studentId = `242P1A05${num}`;
    
    // Generate attendance for last 30 days
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const random = Math.random();
      let status: 'present' | 'absent' | 'late' = 'present';
      if (random < 0.1) status = 'absent';
      else if (random < 0.2) status = 'late';
      
      records.push({
        id: `${studentId}-${date.toISOString().split('T')[0]}`,
        studentId,
        date: date.toISOString().split('T')[0],
        status,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
      });
    }
  }
  return records;
};

// Generate sample timetable
const generateSampleTimetable = (): TimetableEntry[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '12:15 - 01:15', '02:00 - 03:00', '03:00 - 04:00'];
  const subjects = [
    { name: 'Data Structures', teacher: 'Dr. Narashima', room: 'CS-101' },
    { name: 'DBMS', teacher: 'Prof. Ramireddy', room: 'CS-102' },
    { name: 'Operating Systems', teacher: 'Dr. Pavani', room: 'CS-103' },
    { name: 'Computer Networks', teacher: 'Prof. Suresh', room: 'CS-104' },
    { name: 'Web Development', teacher: 'Dr. Priya', room: 'Lab-1' },
    { name: 'Break', teacher: '-', room: '-' },
  ];

  const timetable: TimetableEntry[] = [];
  let id = 1;

  days.forEach((day) => {
    times.forEach((time, index) => {
      const subjectIndex = (days.indexOf(day) + index) % subjects.length;
      const subject = subjects[subjectIndex];
      timetable.push({
        id: `tt-${id++}`,
        day,
        time,
        subject: subject.name,
        teacher: subject.teacher,
        room: subject.room,
      });
    });
  });

  return timetable;
};

interface DataState {
  students: Student[];
  attendance: AttendanceRecord[];
  messages: Message[];
  timetable: TimetableEntry[];
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  markAttendance: (record: AttendanceRecord) => void;
  updateAttendance: (id: string, status: 'present' | 'absent' | 'late') => void;
  sendMessage: (message: Message) => void;
  markMessageRead: (id: string) => void;
  updateTimetable: (entries: TimetableEntry[]) => void;
  getStudentAttendance: (studentId: string) => AttendanceRecord[];
  getStudentMessages: (studentId: string) => Message[];
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      students: generateInitialStudents(),
      attendance: generateSampleAttendance(),
      messages: [],
      timetable: generateSampleTimetable(),

      addStudent: (student) => {
        set((state) => ({
          students: [...state.students, student],
        }));
      },

      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteStudent: (id) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        }));
      },

      markAttendance: (record) => {
        set((state) => {
          const existingIndex = state.attendance.findIndex(
            (a) => a.studentId === record.studentId && a.date === record.date
          );
          if (existingIndex >= 0) {
            const newAttendance = [...state.attendance];
            newAttendance[existingIndex] = record;
            return { attendance: newAttendance };
          }
          return { attendance: [...state.attendance, record] };
        });
      },

      updateAttendance: (id, status) => {
        set((state) => ({
          attendance: state.attendance.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        }));
      },

      sendMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      markMessageRead: (id) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, read: true } : m
          ),
        }));
      },

      updateTimetable: (entries) => {
        set({ timetable: entries });
      },

      getStudentAttendance: (studentId) => {
        return get().attendance.filter((a) => a.studentId === studentId);
      },

      getStudentMessages: (studentId) => {
        return get().messages.filter(
          (m) => m.recipientId === studentId || m.recipientId === 'all'
        );
      },
    }),
    {
      name: 'data-storage',
    }
  )
);
