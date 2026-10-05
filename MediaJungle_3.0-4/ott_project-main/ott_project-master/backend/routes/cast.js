const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get cast member
router.get('/getcast/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, name FROM cast_crew WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cast not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get cast image
router.get('/getcastimage/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT image FROM cast_crew WHERE id = $1', [id]);
    if (result.rows.length === 0 || !result.rows[0].image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(result.rows[0].image);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
