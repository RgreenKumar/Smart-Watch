const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create playlist
router.post('/createplaylist', async (req, res) => {
  try {
    const { title, description, userId } = req.body;
    const result = await pool.query(
      'INSERT INTO playlists (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, description || '']
    );
    const playlist = result.rows[0];
    res.json({
      id: playlist.id,
      userId: playlist.user_id,
      title: playlist.title,
      description: playlist.description,
      audioIds: [],
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Create playlist with audio ID
router.post('/createplaylistid', async (req, res) => {
  try {
    const { title, description, userId, audioId } = req.body;
    const result = await pool.query(
      'INSERT INTO playlists (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, description || '']
    );
    const playlist = result.rows[0];
    if (audioId) {
      await pool.query(
        'INSERT INTO playlist_audios (playlist_id, audio_id) VALUES ($1, $2)',
        [playlist.id, audioId]
      );
    }
    res.json({
      id: playlist.id,
      userId: playlist.user_id,
      title: playlist.title,
      description: playlist.description,
      audioIds: audioId ? [Number(audioId)] : [],
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Add audio to playlist
router.post('/:playlistId/audio/:audioId', async (req, res) => {
  try {
    const { playlistId, audioId } = req.params;
    await pool.query(
      'INSERT INTO playlist_audios (playlist_id, audio_id) VALUES ($1, $2) ON CONFLICT (playlist_id, audio_id) DO NOTHING',
      [playlistId, audioId]
    );
    res.json({ message: 'Audio added to playlist' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get playlist by ID
router.get('/:playlistId/playlists', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const result = await pool.query('SELECT * FROM playlists WHERE id = $1', [playlistId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get playlists by user ID
router.get('/user/:userId/playlists', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT p.*,
             COALESCE(ARRAY_AGG(pa.audio_id) FILTER (WHERE pa.audio_id IS NOT NULL), '{}') as "audioIds"
      FROM playlists p
      LEFT JOIN playlist_audios pa ON p.id = pa.playlist_id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.id DESC
    `, [userId]);
    res.json(result.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description,
      audioIds: r.audioIds || [],
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get playlist with audio details
router.get('/:id/getPlaylistWithAudioDetails', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT pa.audio_id, a.audio_title, a.audio_file_name, a.rating, a.description,
             a.production_company, a.paid, a.certificate_name, a.audio_duration, a.certificate_no
      FROM playlist_audios pa
      JOIN audio_files a ON pa.audio_id = a.id
      WHERE pa.playlist_id = $1
      ORDER BY pa.position
    `, [id]);
    res.json(result.rows.map(r => ({
      id: r.audio_id,
      audio_title: r.audio_title,
      audio_file_name: r.audio_file_name,
      rating: r.rating || '',
      description: r.description || '',
      production_company: r.production_company || '',
      paid: r.paid || false,
      certificate_name: r.certificate_name || '',
      audio_Duration: r.audio_duration || '',
      certificate_no: r.certificate_no || '',
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Delete playlist
router.delete('/:id/delete/playlist', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM playlists WHERE id = $1', [id]);
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Edit playlist
router.patch('/editplaylist/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { title, description } = req.body;
    await pool.query(
      'UPDATE playlists SET title = COALESCE($1, title), description = COALESCE($2, description) WHERE id = $3',
      [title, description, playlistId]
    );
    res.json({ message: 'Playlist updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Remove audio from playlist
router.delete('/:playlistId/audio/:audioId/delete', async (req, res) => {
  try {
    const { playlistId, audioId } = req.params;
    await pool.query('DELETE FROM playlist_audios WHERE playlist_id = $1 AND audio_id = $2', [playlistId, audioId]);
    res.json({ message: 'Audio removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Move audio to playlist
router.patch('/:playlistId/moveAudioToPlaylist/:audioId/:movedPlaylistId', async (req, res) => {
  try {
    const { playlistId, audioId, movedPlaylistId } = req.params;
    await pool.query('DELETE FROM playlist_audios WHERE playlist_id = $1 AND audio_id = $2', [playlistId, audioId]);
    await pool.query(
      'INSERT INTO playlist_audios (playlist_id, audio_id) VALUES ($1, $2) ON CONFLICT (playlist_id, audio_id) DO NOTHING',
      [movedPlaylistId, audioId]
    );
    res.json({ message: 'Audio moved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
