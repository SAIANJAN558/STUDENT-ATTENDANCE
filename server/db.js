import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'smart_classmate.db');

export const db = new DatabaseSync(DB_PATH);

// Initialize schema
export function initDatabase() {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('teacher', 'student', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      roll_number TEXT,
      department TEXT DEFAULT 'Computer Science',
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      roll_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      department TEXT DEFAULT 'Computer Science',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late')),
      subject TEXT,
      marked_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(student_id, date, subject)
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      subject TEXT NOT NULL,
      teacher TEXT NOT NULL,
      room TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(day, time)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (userCount > 0) {
    return;
  }

  console.log('Seeding initial database data...');

  const passwordHash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  // 1. Seed Teacher
  const teacherId = 'usr-teacher-01';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(teacherId, 'teacher@cbit.edu.in', passwordHash, 'teacher', now);

  db.prepare(`
    INSERT INTO profiles (id, user_id, email, name, roll_number, department, phone, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'prof-teacher-01',
    teacherId,
    'teacher@cbit.edu.in',
    'Dr. Narashima Rao',
    null,
    'Computer Science',
    '+91 98765 43210',
    now,
    now
  );

  // 2. Seed Student (Roll No: 242P1A0501)
  const studentId = 'usr-student-01';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(studentId, 'student@cbit.edu.in', passwordHash, 'student', now);

  db.prepare(`
    INSERT INTO profiles (id, user_id, email, name, roll_number, department, phone, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'prof-student-01',
    studentId,
    'student@cbit.edu.in',
    'Aditya Kumar',
    '242P1A0501',
    'Computer Science',
    '+91 98765 43211',
    now,
    now
  );

  // 3. Seed 60 Students
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

  const insertStudent = db.prepare(`
    INSERT INTO students (id, roll_number, name, email, phone, department, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  for (let i = 1; i <= 60; i++) {
    const num = i.toString().padStart(2, '0');
    const rollNumber = `242P1A05${num}`;
    const studentName = names[i - 1] || `Student ${num}`;
    const email = `${rollNumber.toLowerCase()}@cbit.edu.in`;
    const phone = `+91 98765 ${43000 + i}`;
    insertStudent.run(
      randomUUID(),
      rollNumber,
      studentName,
      email,
      phone,
      'Computer Science',
      now,
      now
    );
  }
  db.exec('COMMIT');

  // 4. Seed Timetable
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:15 - 12:15',
    '12:15 - 01:15',
    '02:00 - 03:00',
    '03:00 - 04:00',
  ];
  const subjects = [
    { name: 'Data Structures', teacher: 'Dr. Narashima', room: 'CS-101' },
    { name: 'DBMS', teacher: 'Prof. Ramireddy', room: 'CS-102' },
    { name: 'Operating Systems', teacher: 'Dr. Pavani', room: 'CS-103' },
    { name: 'Computer Networks', teacher: 'Prof. Suresh', room: 'CS-104' },
    { name: 'Web Development', teacher: 'Dr. Priya', room: 'Lab-1' },
    { name: 'Break', teacher: '-', room: '-' },
  ];

  const insertTimetable = db.prepare(`
    INSERT INTO timetable (id, day, time, subject, teacher, room, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  days.forEach((day) => {
    times.forEach((time, index) => {
      const subjectIndex = (days.indexOf(day) + index) % subjects.length;
      const subj = subjects[subjectIndex];
      insertTimetable.run(
        randomUUID(),
        day,
        time,
        subj.name,
        subj.teacher,
        subj.room,
        now
      );
    });
  });
  db.exec('COMMIT');

  // 5. Seed Attendance for past 20 days
  const attendanceSubjects = [
    'Data Structures',
    'DBMS',
    'Operating Systems',
    'Computer Networks',
    'Web Development',
  ];

  const insertAttendance = db.prepare(`
    INSERT OR REPLACE INTO attendance_records (id, student_id, date, status, subject, marked_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 20; dayOffset++) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOffset);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // Skip weekends

    const dateStr = d.toISOString().split('T')[0];
    const subj = attendanceSubjects[dayOffset % attendanceSubjects.length];

    for (let i = 1; i <= 60; i++) {
      const num = i.toString().padStart(2, '0');
      const rollNumber = `242P1A05${num}`;

      // 85% present, 10% absent, 5% late
      const rand = Math.random();
      let status = 'present';
      if (rand < 0.1) status = 'absent';
      else if (rand < 0.16) status = 'late';

      insertAttendance.run(
        randomUUID(),
        rollNumber,
        dateStr,
        status,
        subj,
        'teacher@cbit.edu.in',
        now
      );
    }
  }
  db.exec('COMMIT');

  // 6. Seed Messages & Announcements
  const insertMessage = db.prepare(`
    INSERT INTO messages (id, sender_id, recipient_id, subject, content, read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  insertMessage.run(
    randomUUID(),
    'teacher@cbit.edu.in',
    'all',
    'Mid-term Examination Schedule',
    'The mid-term examinations for Semester IV Computer Science will commence from next Monday. Please review Units 1 to 3.',
    0,
    new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  );

  insertMessage.run(
    randomUUID(),
    'teacher@cbit.edu.in',
    'all',
    'Mini Project Phase-1 Abstract Submission',
    'All student batches must submit their finalized mini-project abstract and guide endorsement form before 5 PM this Friday.',
    0,
    new Date(Date.now() - 3600000 * 18).toISOString()
  );

  insertMessage.run(
    randomUUID(),
    'teacher@cbit.edu.in',
    '242P1A0501',
    'DBMS Lab Observation Book Verification',
    'Aditya, please bring your completed DBMS experiment 4 & 5 observation notes for verification during tomorrow afternoon lab session.',
    0,
    new Date(Date.now() - 3600000 * 5).toISOString()
  );
  db.exec('COMMIT');

  console.log('Database seeded successfully with demo users, 60 students, timetable, attendance, and messages!');
}
