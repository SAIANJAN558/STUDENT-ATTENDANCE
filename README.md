# Smart Classmate - Fullstack Attendance & Student Portal

A modern, full-stack educational portal designed for colleges and universities. It allows teachers to mark attendance, manage student records, update timetables, and broadcast announcements, while giving students live dashboards to track attendance percentages, review schedules, and view notifications.

---

## 🚀 Architecture Overview

This project is built as a complete, self-contained fullstack application:

```
┌────────────────────────────────────────────────────────┐
│                      FRONTEND                          │
│  React 18 + Vite + Tailwind CSS + Shadcn UI + Recharts  │
│  Port: http://localhost:8080 (Proxies /api to 5000)    │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / JWT)
┌───────────────────────────▼────────────────────────────┐
│                      BACKEND                           │
│  Node.js (v22) + Express + JWT Auth + Bcrypt           │
│  Port: http://localhost:5000                           │
└───────────────────────────┬────────────────────────────┘
                            │ Direct SQL Execution
┌───────────────────────────▼────────────────────────────┐
│                      DATABASE                          │
│  Embedded SQLite Engine (server/smart_classmate.db)    │
│  WAL Mode, Automatic Schema Migration & Seeding       │
└────────────────────────────────────────────────────────┘
```

---

## 🔑 Default Demo Credentials

The database automatically seeds realistic demo data upon first start:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Teacher** | `teacher@cbit.edu.in` | `password123` | Dr. Narashima Rao (Computer Science) |
| **Student** | `student@cbit.edu.in` | `password123` | Aditya Kumar (Roll: `242P1A0501`) |

> You can also click **Sign Up** on the login page to register any new teacher or student account!

---

## 📦 Features

### 👨‍🏫 Teacher Portal
- **Dashboard**: Live student count, overall attendance percentage, upcoming class timetable, attendance trends.
- **Student Directory**: Full CRUD for students (Add, Search, Edit, Delete) across departments.
- **Attendance Management**: Single-click daily attendance marking (`Present`, `Absent`, `Late`), "All Present" / "All Absent" shortcuts, and bulk persistence.
- **Timetable Management**: Interactive weekly schedule editor for class times, subjects, faculty names, and room numbers.
- **Communications**: Send broadcast announcements to the entire class (`All Students`) or direct individual messages.

### 🎓 Student Portal
- **Dashboard**: Real-time attendance meter, status alert indicators, 14-day trend line graph, and unread notifications.
- **Attendance History**: Monthly breakdown, subject-wise statistics, and color-coded status badges.
- **Class Timetable**: Highlighted schedule showing today's ongoing classes, teachers, and lecture halls.
- **Inbox**: Announcement feeds and direct messages with unread counts and read receipt toggles.
- **Profile**: View and manage contact information, roll number, and department.

---

## 🛠️ Quick Start

### Prerequisites

- Node.js 22.5.0 or later
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Fullstack Application
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Run Automated API Tests
To verify all authentication, database, attendance, timetable, and message endpoints:
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

### 5. Deploy to Render

1. Sign in to [Render](https://render.com) and choose **New** → **Blueprint**.
2. Connect the `SAIANJAN558/STUDENT-ATTENDANCE` GitHub repository and deploy the `render.yaml` blueprint.
3. Wait for the build to finish, then open the `smart-classmate` service URL provided by Render.
4. Create an account using **Sign Up**. For safety, the known demo accounts are not seeded in production.

The free Render service can sleep when idle, and its local SQLite database is temporary. User accounts, attendance, and other changes can be lost when the service restarts or redeploys. Persistent storage requires a paid Render plan and a persistent disk.

---

## 🗄️ Database Structure

The database is powered by SQLite located at `server/smart_classmate.db`:

- `users`: User authentication records (id, email, password_hash, role, created_at)
- `profiles`: User profile data (id, user_id, email, name, roll_number, department, phone)
- `students`: Student directory (id, roll_number, name, email, phone, department)
- `attendance_records`: Attendance history (id, student_id, date, status, subject, marked_by)
- `timetable`: Weekly class slots (id, day, time, subject, teacher, room)
- `messages`: Announcements and direct messages (id, sender_id, recipient_id, subject, content, read)

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new teacher or student account
- `POST /api/auth/login` - Authenticate with email and password
- `GET /api/auth/me` - Fetch profile of currently authenticated user
- `PUT /api/auth/profile` - Update profile information

### Students (`/api/students`)
- `GET /api/students` - Retrieve all students ordered by roll number
- `GET /api/students/:idOrRoll` - Get details of a specific student
- `POST /api/students` - Add a new student record
- `PUT /api/students/:id` - Edit student details
- `DELETE /api/students/:id` - Remove student record

### Attendance (`/api/attendance`)
- `GET /api/attendance` - Fetch attendance records (supports filtering by `student_id`, `date`, `subject`)
- `GET /api/attendance/student/:rollNumber` - Fetch all attendance records for a student
- `POST /api/attendance` - Mark attendance for a student
- `POST /api/attendance/bulk` - Save attendance in bulk for a class

### Timetable (`/api/timetable`)
- `GET /api/timetable` - Retrieve weekly timetable
- `POST /api/timetable` - Batch update or replace timetable
- `PUT /api/timetable` - Update an individual class time slot
- `DELETE /api/timetable/:id` - Delete class slot

### Messages (`/api/messages`)
- `GET /api/messages` - Retrieve messages (filtered by user or recipient)
- `POST /api/messages` - Send announcement or direct message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message
