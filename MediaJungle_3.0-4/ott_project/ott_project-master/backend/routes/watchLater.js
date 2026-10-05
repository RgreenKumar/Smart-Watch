const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add to watch later
router.post('/watchlater/video', async (req, res) => {
  try {
    const { videoId, userId } = req.body;
    if (!videoId || !userId) return res.status(400).json({ message: 'videoId and userId required' });
    const video = await pool.query('SELECT video_title FROM videos WHERE id = $1', [videoId]);
    const videoTitle = video.rows.length > 0 ? video.rows[0].video_title : '';
    await pool.query(
      'INSERT INTO watch_later (video_id, user_id, video_title) VALUES ($1, $2, $3) ON CONFLICT (video_id, user_id) DO NOTHING',
      [videoId, userId, videoTitle]
    );
    res.json({ message: 'Added to watch later' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get watch later videos
router.get('/:userId/Watchlater', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT video_id as "videoId", video_title as "videoTitle" FROM watch_later WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Remove from watch later
router.delete('/:userId/removewatchlater', async (req, res) => {
  try {
    const { userId } = req.params;
    const { videoId } = req.body;
    if (!videoId) return res.status(400).json({ message: 'videoId required' });
    await pool.query('DELETE FROM watch_later WHERE user_id = $1 AND video_id = $2', [userId, videoId]);
    res.json({ message: 'Removed from watch later' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
