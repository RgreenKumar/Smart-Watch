const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all audio DTOs
router.get('/getaudiodetailsdto', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.audio_title as "audioTitle", a.audio_file_name as "fileName",
             a.audio_file_name as "audio_file_name",
             a.thumbnail_base64 as "thumbnail",
             COALESCE(
               (SELECT json_build_object('category_id', c.category_id, 'categories', c.categories)
                FROM audio_categories ac
                JOIN categories c ON ac.category_id = c.category_id
                WHERE ac.audio_id = a.id LIMIT 1),
               json_build_object('category_id', 0, 'categories', 'Uncategorized')
             ) as category
      FROM audio_files a
      ORDER BY a.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get audio DTO error:', err);
    res.status(500).json({ message: 'Failed to load audio' });
  }
});

// Audio container details (grouped by category)
router.get('/audioContainerDetails', async (req, res) => {
  try {
    const categories = await pool.query('SELECT category_id, categories FROM categories ORDER BY category_id');
    const containers = [];
    for (const cat of categories.rows) {
      const audios = await pool.query(`
        SELECT a.id, a.audio_title, a.audio_file_name, a.rating, a.description,
               a.production_company, a.paid, a.certificate_name, a.audio_duration, a.certificate_no,
               a.movie_name
        FROM audio_files a
        JOIN audio_categories ac ON a.id = ac.audio_id AND ac.category_id = $1
      `, [cat.category_id]);
      if (audios.rows.length > 0) {
        containers.push({
          category_name: cat.categories,
          audiolist: audios.rows.map(a => ({
            id: a.id,
            audio_title: a.audio_title,
            audio_file_name: a.audio_file_name,
            rating: a.rating || '',
            description: a.description || '',
            production_company: a.production_company || '',
            paid: a.paid || false,
            certificate_name: a.certificate_name || '',
            audio_Duration: a.audio_duration || '',
            certificate_no: a.certificate_no || '',
            movie_name: a.movie_name || '',
          })),
        });
      }
    }
    res.json(containers);
  } catch (err) {
    console.error('Audio container error:', err);
    res.status(500).json({ message: 'Failed' });
  }
});

// Audio detail (simple)
router.get('/audio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT a.*,
             COALESCE(
               (SELECT json_build_object('category_id', c.category_id, 'categories', c.categories)
                FROM audio_categories ac
                JOIN categories c ON ac.category_id = c.category_id
                WHERE ac.audio_id = a.id LIMIT 1),
               json_build_object('category_id', 0, 'categories', 'Uncategorized')
             ) as category
      FROM audio_files a WHERE a.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Audio not found' });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      audioTitle: row.audio_title,
      fileName: row.audio_file_name,
      thumbnail: row.thumbnail_base64 || '',
      category: row.category,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get audio detail (full)
router.get('/getaudio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT a.*,
             COALESCE(
               (SELECT json_agg(json_build_object('category_id', c.category_id, 'categories', c.categories))
                FROM audio_categories ac
                JOIN categories c ON ac.category_id = c.category_id
                WHERE ac.audio_id = a.id),
               '[]'::json
             ) as category
      FROM audio_files a WHERE a.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Audio not found' });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      audioTitle: row.audio_title,
      audio_title: row.audio_title,
      audio_file_name: row.audio_file_name,
      audio_Duration: row.audio_duration || '',
      rating: row.rating || '',
      description: row.description || '',
      production_company: row.production_company || '',
      paid: row.paid || false,
      certificate_name: row.certificate_name || '',
      certificate_no: row.certificate_no || '',
      movie_name: row.movie_name || '',
      category: row.category,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Audio thumbnail (base64)
router.get('/getaudiothumbnailsbyid/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT thumbnail_base64 FROM audio_files WHERE id = $1', [id]);
    if (result.rows.length === 0 || !result.rows[0].thumbnail_base64) {
      return res.status(404).json({ message: 'Thumbnail not found' });
    }
    res.json({ thumbnail: result.rows[0].thumbnail_base64 });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Audio file streaming
router.get('/:fileName/file', async (req, res) => {
  try {
    const { fileName } = req.params;
    // Try by ID first, then by filename
    let result;
    if (/^\d+$/.test(fileName)) {
      result = await pool.query('SELECT audio_file FROM audio_files WHERE id = $1', [fileName]);
    } else {
      result = await pool.query('SELECT audio_file FROM audio_files WHERE audio_file_name = $1', [fileName]);
    }
    if (result.rows.length === 0 || !result.rows[0].audio_file) {
      return res.status(404).json({ message: 'Audio file not found' });
    }
    const audioFile = result.rows[0].audio_file;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : audioFile.length - 1;
      const chunk = audioFile.slice(start, end + 1);
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${audioFile.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunk.length,
        'Content-Type': 'audio/mpeg',
      });
      res.end(chunk);
    } else {
      res.writeHead(200, {
        'Content-Length': audioFile.length,
        'Content-Type': 'audio/mpeg',
      });
      res.end(audioFile);
    }
  } catch (err) {
    console.error('Audio file error:', err);
    res.status(500).json({ message: 'Failed' });
  }
});

// Audio banner image
router.get('/getimage/banner/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT banner_image FROM audio_files WHERE id = $1', [id]);
    if (result.rows.length === 0 || !result.rows[0].banner_image) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(result.rows[0].banner_image);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// All audio banners
router.get('/getallaudiobanner', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, audio_id as "audioId" FROM audio_banners ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
