const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all plans
router.get('/GetAllPlans', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.planname, p.amount,
             COALESCE(
               (SELECT json_agg(json_build_object('id', t.id, 'tenure_name', t.tenure_name, 'months', t.months, 'discount', t.discount))
                FROM tenures t WHERE t.plan_id = p.id),
               '[]'::json
             ) as tenure,
             COALESCE(
               (SELECT json_agg(json_build_object('id', pf.id, 'featureId', pf.feature_id, 'active', pf.active))
                FROM plan_features pf WHERE pf.plan_id = p.id),
               '[]'::json
             ) as features
      FROM plans p
      ORDER BY p.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get all tenures
router.get('/tenures', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, tenure_name, months, discount FROM tenures ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get all features
router.get('/GetAllFeatures', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, feature_name as features FROM features ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get features by plan ID
router.get('/GetFeaturesByPlanId', async (req, res) => {
  try {
    const planId = req.query.planId;
    if (!planId) return res.json([]);
    const result = await pool.query(
      `SELECT pf.id, pf.feature_id as "featureId", pf.active
       FROM plan_features pf WHERE pf.plan_id = $1`,
      [planId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Get razorpay settings
router.get('/getrazorpay', async (req, res) => {
  try {
    const result = await pool.query('SELECT razorpay_key, razorpay_secret_key FROM razorpay_settings LIMIT 1');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
