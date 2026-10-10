import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/students
router.get('/', optionalAuth, (req, res) => {
  try {
    const students = db.prepare('SELECT * FROM students ORDER BY roll_number ASC').all();
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch students: ' + err.message });
  }
});

// GET /api/students/:idOrRoll
router.get('/:idOrRoll', (req, res) => {
  try {
    const { idOrRoll } = req.params;
    const student = db.prepare(`
      SELECT * FROM students 
      WHERE id = ? OR UPPER(roll_number) = UPPER(?)
    `).get(idOrRoll, idOrRoll);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json(student);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch student: ' + err.message });
  }
});

// POST /api/students
router.post('/', (req, res) => {
  try {
    const { roll_number, name, email, phone, department = 'Computer Science' } = req.body;

    if (!roll_number || !name) {
      return res.status(400).json({ error: 'Roll number and name are required' });
    }

    const cleanRoll = roll_number.trim().toUpperCase();
    const existing = db.prepare('SELECT id FROM students WHERE UPPER(roll_number) = ?').get(cleanRoll);
    if (existing) {
      return res.status(400).json({ error: `Student with roll number ${cleanRoll} already exists` });
    }

    const studentEmail = email || `${cleanRoll.toLowerCase()}@cbit.edu.in`;
    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO students (id, roll_number, name, email, phone, department, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, cleanRoll, name.trim(), studentEmail, phone || null, department, now, now);

    const created = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create student: ' + err.message });
  }
});

// PUT /api/students/:id
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, department, email } = req.body;

    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const now = new Date().toISOString();
    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedPhone = phone !== undefined ? phone : existing.phone;
    const updatedDept = department !== undefined ? department : existing.department;
    const updatedEmail = email !== undefined ? email : existing.email;

    db.prepare(`
      UPDATE students
      SET name = ?, phone = ?, department = ?, email = ?, updated_at = ?
      WHERE id = ?
    `).run(updatedName, updatedPhone, updatedDept, updatedEmail, now, id);

    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update student: ' + err.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM students WHERE id = ? OR roll_number = ?').get(id, id);
    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    db.prepare('DELETE FROM students WHERE id = ?').run(existing.id);
    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete student: ' + err.message });
  }
});

export default router;
