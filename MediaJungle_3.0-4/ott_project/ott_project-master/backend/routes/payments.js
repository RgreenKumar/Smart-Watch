const express = require('express');
const router = express.Router();
const pool = require('../db');

// Calculate discount
router.post('/calculateDiscount', async (req, res) => {
  try {
    const { planId, tenureId } = req.body;
    const plan = await pool.query('SELECT * FROM plans WHERE id = $1', [planId]);
    const tenure = await pool.query('SELECT * FROM tenures WHERE id = $1', [tenureId]);
    if (plan.rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
    const baseAmount = plan.rows[0].amount;
    const discount = tenure.rows.length > 0 ? tenure.rows[0].discount : 0;
    const months = tenure.rows.length > 0 ? tenure.rows[0].months : 1;
    const totalAmount = baseAmount * months * (1 - discount / 100);
    res.json({
      baseAmount,
      discount,
      months,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Confirm payment
router.post('/confirmPayment', async (req, res) => {
  try {
    const { userId, planId, amount, razorpayOrderId, razorpayPaymentId } = req.body;
    await pool.query(
      `INSERT INTO payments (user_id, plan_id, amount, status, razorpay_order_id, razorpay_payment_id)
       VALUES ($1, $2, $3, 'completed', $4, $5)`,
      [userId, planId, amount, razorpayOrderId || '', razorpayPaymentId || '']
    );
    res.json({ message: 'Payment confirmed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Create payment order
router.post('/payment', async (req, res) => {
  try {
    const { userId, planId, amount } = req.body;
    const result = await pool.query(
      `INSERT INTO payments (user_id, plan_id, amount, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [userId, planId, amount]
    );
    res.json({ orderId: `order_${result.rows[0].id}`, amount });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

// Payment history
router.get('/paymentHistory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT p.*, pl.planname
       FROM payments p
       LEFT JOIN plans pl ON p.plan_id = pl.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
