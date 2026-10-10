import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';

const router = Router();

// GET /api/attendance
router.get('/', (req, res) => {
  try {
    const { student_id, date, subject } = req.query;
    let query = 'SELECT * FROM attendance_records WHERE 1=1';
    const params = [];

    if (student_id) {
      query += ' AND student_id = ?';
      params.push(student_id);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    if (subject) {
      query += ' AND subject = ?';
      params.push(subject);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const records = db.prepare(query).all(...params);
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch attendance: ' + err.message });
  }
});

// GET /api/attendance/student/:rollNumber
router.get('/student/:rollNumber', (req, res) => {
  try {
    const { rollNumber } = req.params;
    const records = db.prepare(`
      SELECT * FROM attendance_records 
      WHERE UPPER(student_id) = UPPER(?) 
      ORDER BY date DESC
    `).all(rollNumber);

    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch student attendance: ' + err.message });
  }
});

// POST /api/attendance
router.post('/', (req, res) => {
  try {
    const { student_id, date, status, subject, marked_by } = req.body;

    if (!student_id || !date || !status) {
      return res.status(400).json({ error: 'Student ID, date, and status are required' });
    }

    const cleanStatus = status.toLowerCase();
    if (!['present', 'absent', 'late'].includes(cleanStatus)) {
      return res.status(400).json({ error: 'Status must be present, absent, or late' });
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    const insertOrReplace = db.prepare(`
      INSERT OR REPLACE INTO attendance_records (id, student_id, date, status, subject, marked_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrReplace.run(
      id,
      student_id.trim().toUpperCase(),
      date,
      cleanStatus,
      subject || null,
      marked_by || null,
      now
    );

    const record = db.prepare(`
      SELECT * FROM attendance_records 
      WHERE student_id = ? AND date = ? AND (subject = ? OR (subject IS NULL AND ? IS NULL))
    `).get(student_id.trim().toUpperCase(), date, subject || null, subject || null);

    return res.status(201).json(record || { id, student_id, date, status: cleanStatus, subject, marked_by });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark attendance: ' + err.message });
  }
});

// POST /api/attendance/bulk
router.post('/bulk', (req, res) => {
  try {
    const records = Array.isArray(req.body) ? req.body : req.body.records;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records must be a non-empty array' });
    }

    const now = new Date().toISOString();
    const insertOrReplace = db.prepare(`
      INSERT OR REPLACE INTO attendance_records (id, student_id, date, status, subject, marked_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN TRANSACTION');
    try {
      for (const rec of records) {
        if (!rec.student_id || !rec.date || !rec.status) continue;
        const cleanStatus = rec.status.toLowerCase();
        if (!['present', 'absent', 'late'].includes(cleanStatus)) continue;

        insertOrReplace.run(
          randomUUID(),
          rec.student_id.trim().toUpperCase(),
          rec.date,
          cleanStatus,
          rec.subject || null,
          rec.marked_by || null,
          now
        );
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return res.json({ message: 'Attendance marked successfully', count: records.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to bulk mark attendance: ' + err.message });
  }
});

export default router;
