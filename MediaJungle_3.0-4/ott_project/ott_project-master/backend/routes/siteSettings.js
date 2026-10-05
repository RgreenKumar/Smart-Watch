const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get site settings (icon, logo, etc.)
router.get('/GetsiteSettings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings ORDER BY id LIMIT 1');
    if (result.rows.length === 0) {
      return res.json([{ id: 1, site_name: 'Media Jungle', icon: '' }]);
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json([{ id: 1, site_name: 'Media Jungle', icon: '' }]);
  }
});

module.exports = router;
