const express = require('express');
const router = express.Router();
const pool = require('../db');

// Like audio
router.post('/favourite/audio', async (req, res) => {
  try {
    const { audioId, userId } = req.body;
    if (!audioId || !userId) return res.status(400).json({ message: 'audioId and userId required' });
    await pool.query(
      'INSERT INTO favourite_audio (audio_id, user_id) VALUES ($1, $2) ON CONFLICT (audio_id, user_id) DO NOTHING',
      [audioId, userId]
    );
    res.json({ message: 'Audio liked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get user's liked audios
router.get('/:userId/UserAudios', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT audio_id as "audioId" FROM favourite_audio WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Unlike audio
router.delete('/:userId/removeFavoriteAudio', async (req, res) => {
  try {
    const { userId } = req.params;
    const audioId = req.query.audioId;
    if (!audioId) return res.status(400).json({ message: 'audioId required' });
    await pool.query('DELETE FROM favourite_audio WHERE user_id = $1 AND audio_id = $2', [userId, audioId]);
    res.json({ message: 'Audio unliked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
