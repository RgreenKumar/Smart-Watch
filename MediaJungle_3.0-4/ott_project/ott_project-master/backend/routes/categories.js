const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all categories
router.get('/GetAllCategories', async (req, res) => {
  try {
    const result = await pool.query('SELECT category_id, categories FROM categories ORDER BY category_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get category by ID
router.get('/GetCategoryById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT category_id, categories FROM categories WHERE category_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get category names by IDs
router.get('/categorylist/category', async (req, res) => {
  try {
    const ids = req.query.categoryId;
    if (!ids) return res.json([]);
    const idArray = Array.isArray(ids) ? ids.map(Number) : [Number(ids)];
    const result = await pool.query(
      'SELECT categories FROM categories WHERE category_id = ANY($1)',
      [idArray]
    );
    res.json(result.rows.map(r => r.categories));
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
