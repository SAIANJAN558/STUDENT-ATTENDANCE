import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { email, password, name, role, rollNumber, department = 'Computer Science', phone } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.toLowerCase();

    if (!['teacher', 'student'].includes(cleanRole)) {
      return res.status(400).json({ error: 'Role must be either teacher or student' });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered. Please sign in instead.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = randomUUID();
    const profileId = randomUUID();
    const now = new Date().toISOString();
    const rollNo = cleanRole === 'student' ? (rollNumber?.trim().toUpperCase() || null) : null;

    db.exec('BEGIN TRANSACTION');
    try {
      db.prepare(`
        INSERT INTO users (id, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, cleanEmail, passwordHash, cleanRole, now);

      db.prepare(`
        INSERT INTO profiles (id, user_id, email, name, roll_number, department, phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(profileId, userId, cleanEmail, name.trim(), rollNo, department, phone || null, now, now);

      // If student and has rollNumber, ensure students table also has them
      if (cleanRole === 'student' && rollNo) {
        const existingStudent = db.prepare('SELECT id FROM students WHERE roll_number = ?').get(rollNo);
        if (!existingStudent) {
          db.prepare(`
            INSERT INTO students (id, roll_number, name, email, phone, department, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(randomUUID(), rollNo, name.trim(), cleanEmail, phone || null, department, now, now);
        }
      }

      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId);
    const token = generateToken({ id: userId, email: cleanEmail, role: cleanRole });

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        email: cleanEmail,
        name: profile.name,
        role: cleanRole,
        rollNumber: profile.roll_number,
        phone: profile.phone,
        department: profile.department,
      },
      profile,
      role: cleanRole,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || 'User',
        role: user.role,
        rollNumber: profile?.roll_number,
        phone: profile?.phone,
        department: profile?.department,
      },
      profile,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
    return res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: profile?.name || 'User',
        role: req.user.role,
        rollNumber: profile?.roll_number,
        phone: profile?.phone,
        department: profile?.department,
      },
      profile,
      role: req.user.role,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching user profile: ' + err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, (req, res) => {
  try {
    const { name, phone, department, roll_number } = req.body;
    const now = new Date().toISOString();

    const currentProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);
    if (!currentProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const updatedName = name !== undefined ? name : currentProfile.name;
    const updatedPhone = phone !== undefined ? phone : currentProfile.phone;
    const updatedDept = department !== undefined ? department : currentProfile.department;
    const updatedRoll = roll_number !== undefined ? roll_number : currentProfile.roll_number;

    db.prepare(`
      UPDATE profiles
      SET name = ?, phone = ?, department = ?, roll_number = ?, updated_at = ?
      WHERE user_id = ?
    `).run(updatedName, updatedPhone, updatedDept, updatedRoll, now, req.user.id);

    const updatedProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.user.id);

    return res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: updatedProfile.name,
        role: req.user.role,
        rollNumber: updatedProfile.roll_number,
        phone: updatedProfile.phone,
        department: updatedProfile.department,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error updating profile: ' + err.message });
  }
});

export default router;
