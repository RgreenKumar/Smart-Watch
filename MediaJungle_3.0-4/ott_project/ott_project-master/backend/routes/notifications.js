const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get user notifications
router.get('/usernotifications', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json([]);
    const result = await pool.query(
      'SELECT id, title, message, notimage FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Mark all as read
router.post('/markAllAsReaduser', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ message: 'OK' });
    await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Unread count
router.get('/unreadCountuser', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json(0);
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    res.json(parseInt(result.rows[0].count));
  } catch (err) {
    res.status(500).json(0);
  }
});

// Clear all notifications
router.get('/clearAlluser', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.json({ message: 'OK' });
    await pool.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    res.json({ message: 'All cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
