import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './db.js';
import authRouter from './routes/auth.js';
import studentsRouter from './routes/students.js';
import attendanceRouter from './routes/attendance.js';
import timetableRouter from './routes/timetable.js';
import messagesRouter from './routes/messages.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_PATH = path.resolve(__dirname, '../dist');

// Initialize Database & Seed data
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow frontend dev origins
  credentials: true,
}));
app.use(express.json());

// Request logger for dev
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/timetable', timetableRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'smart-classmate-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.use(express.static(DIST_PATH));
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  res.sendFile(path.join(DIST_PATH, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  Smart Classmate Backend Server Running!      `);
  console.log(`  URL: http://localhost:${PORT}                `);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Database: SQLite (smart_classmate.db)       `);
  console.log(`===============================================`);
});

export default app;
