const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const multer = require('multer');

const JWT_SECRET = process.env.JWT_SECRET || 'media_jungle_secret_key_2024';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, mobnum, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, mobnum, password, is_verified) VALUES ($1, $2, $3, $4, true) RETURNING id, username, email',
      [username, email, mobnum || '', hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, userId: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.is_verified) {
      return res.status(403).json({ message: 'Please verify your email', isVerified: false, status: 'UNVERIFIED' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, id: user.id, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Send OTP (simplified — stores code in DB; in production use email/SMTP)
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'This email is already registered' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query('DELETE FROM otp_codes WHERE email = $1', [email]);
    await pool.query('INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)', [email, code, expiresAt]);
    console.log(`OTP for ${email}: ${code}`);
    // No SMTP configured locally — return the code in the response so users can complete signup.
    const smtpConfigured = process.env.SMTP_USER && !process.env.SMTP_USER.includes('your-email');
    if (!smtpConfigured) {
      res.json(`Verification code sent to ${email}. Your OTP: ${code}`);
    } else {
      res.json(`Verification code sent to ${email}`);
    }
  } catch (err) {
    console.error('Send-code error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
    const result = await pool.query(
      'SELECT * FROM otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, code]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    await pool.query('DELETE FROM otp_codes WHERE email = $1', [email]);
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify-code error:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Forget Password
router.post('/forgetPassword', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: 'Email and new password are required' });
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('ForgetPassword error:', err);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Get User by ID
router.get('/GetUserById/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, email, mobnum, profile_image FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      mobnum: user.mobnum,
      profileImage: user.profile_image ? user.profile_image.toString('base64') : null,
    });
  } catch (err) {
    console.error('GetUserById error:', err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update User Profile (multipart)
const upload = multer({ storage: multer.memoryStorage() });
router.put('/updateUser/:id', upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, mobnum } = req.body;
    const profileImage = req.file ? req.file.buffer : null;
    if (profileImage) {
      await pool.query(
        'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), mobnum = COALESCE($3, mobnum), profile_image = $4 WHERE id = $5',
        [username, email, mobnum, profileImage, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), mobnum = COALESCE($3, mobnum) WHERE id = $4',
        [username, email, mobnum, id]
      );
    }
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('UpdateUser error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change Password
router.patch('/Update/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const newPassword = req.query.password || req.body.password;
    if (!newPassword) return res.status(400).json({ message: 'Password is required' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('ChangePassword error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Get Profile Image
router.get('/GetProfileImage/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT profile_image FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0 || !result.rows[0].profile_image) {
      return res.status(404).json({ message: 'No image' });
    }
    res.set('Content-Type', 'image/jpeg');
    res.send(result.rows[0].profile_image);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
