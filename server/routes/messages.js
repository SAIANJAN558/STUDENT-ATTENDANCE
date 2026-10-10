import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/messages
router.get('/', optionalAuth, (req, res) => {
  try {
    const { recipient_id, sender_id } = req.query;

    if (recipient_id) {
      const messages = db.prepare(`
        SELECT * FROM messages 
        WHERE recipient_id = ? OR recipient_id = 'all'
        ORDER BY created_at DESC
      `).all(recipient_id);
      return res.json(messages.map(m => ({ ...m, read: Boolean(m.read) })));
    }

    if (sender_id) {
      const messages = db.prepare(`
        SELECT * FROM messages 
        WHERE sender_id = ?
        ORDER BY created_at DESC
      `).all(sender_id);
      return res.json(messages.map(m => ({ ...m, read: Boolean(m.read) })));
    }

    // If authenticated student, filter to their messages or broadcasts
    if (req.user && req.user.role === 'student' && req.user.profile) {
      const rollNumber = req.user.profile.roll_number || '';
      const email = req.user.email;
      const messages = db.prepare(`
        SELECT * FROM messages 
        WHERE recipient_id = ? 
           OR recipient_id = ? 
           OR recipient_id = 'all'
           OR sender_id = ?
        ORDER BY created_at DESC
      `).all(rollNumber, email, email);
      return res.json(messages.map(m => ({ ...m, read: Boolean(m.read) })));
    }

    // Default: return all messages ordered by newest first
    const all = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    return res.json(all.map(m => ({ ...m, read: Boolean(m.read) })));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch messages: ' + err.message });
  }
});

// POST /api/messages
router.post('/', (req, res) => {
  try {
    const { sender_id, recipient_id, subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const sender = sender_id || 'teacher@cbit.edu.in';
    const recipient = recipient_id || 'all';

    db.prepare(`
      INSERT INTO messages (id, sender_id, recipient_id, subject, content, read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(id, sender, recipient, subject.trim(), content.trim(), now);

    const created = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    return res.status(201).json({ ...created, read: Boolean(created.read) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message: ' + err.message });
  }
});

// PUT or PATCH /api/messages/:id/read
const markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    return res.json({ ...updated, read: Boolean(updated.read) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update message: ' + err.message });
  }
};

router.put('/:id/read', markAsRead);
router.patch('/:id/read', markAsRead);

// DELETE /api/messages/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete message: ' + err.message });
  }
});

export default router;
