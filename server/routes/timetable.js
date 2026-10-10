import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';

const router = Router();

// Order definition for sorting days
const dayOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

// GET /api/timetable
router.get('/', (req, res) => {
  try {
    const raw = db.prepare('SELECT * FROM timetable').all();
    const sorted = raw.sort((a, b) => {
      const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
      if (dayDiff !== 0) return dayDiff;
      return a.time.localeCompare(b.time);
    });
    return res.json(sorted);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch timetable: ' + err.message });
  }
});

// POST /api/timetable (Batch replace / upsert timetable)
router.post('/', (req, res) => {
  try {
    const entries = Array.isArray(req.body) ? req.body : req.body.entries;

    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Timetable entries must be an array' });
    }

    const now = new Date().toISOString();
    const insertOrReplace = db.prepare(`
      INSERT OR REPLACE INTO timetable (id, day, time, subject, teacher, room, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    db.exec('BEGIN TRANSACTION');
    try {
      for (const entry of entries) {
        if (!entry.day || !entry.time || !entry.subject) continue;
        insertOrReplace.run(
          entry.id || randomUUID(),
          entry.day,
          entry.time,
          entry.subject,
          entry.teacher || '',
          entry.room || '',
          now
        );
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    const updated = db.prepare('SELECT * FROM timetable').all();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update timetable: ' + err.message });
  }
});

// PUT /api/timetable (Update single entry by day and time)
router.put('/', (req, res) => {
  try {
    const { day, time, subject, teacher, room } = req.body;
    if (!day || !time) {
      return res.status(400).json({ error: 'Day and time are required' });
    }

    const existing = db.prepare('SELECT * FROM timetable WHERE day = ? AND time = ?').get(day, time);
    const now = new Date().toISOString();

    if (existing) {
      db.prepare(`
        UPDATE timetable
        SET subject = ?, teacher = ?, room = ?
        WHERE day = ? AND time = ?
      `).run(subject ?? existing.subject, teacher ?? existing.teacher, room ?? existing.room, day, time);
    } else {
      db.prepare(`
        INSERT INTO timetable (id, day, time, subject, teacher, room, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(randomUUID(), day, time, subject || '', teacher || '', room || '', now);
    }

    const updated = db.prepare('SELECT * FROM timetable WHERE day = ? AND time = ?').get(day, time);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update timetable slot: ' + err.message });
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM timetable WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete timetable entry: ' + err.message });
  }
});

export default router;
