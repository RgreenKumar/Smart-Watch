const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { authMiddleware } = require('./middleware/auth');
const { startRelayServer } = require('./relay');

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const audioRoutes = require('./routes/audio');
const categoryRoutes = require('./routes/categories');
const castRoutes = require('./routes/cast');
const favouriteRoutes = require('./routes/favourites');
const watchLaterRoutes = require('./routes/watchLater');
const playlistRoutes = require('./routes/playlists');
const planRoutes = require('./routes/plans');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const siteRoutes = require('./routes/siteSettings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(authMiddleware);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes — all under /api/v2
app.use('/api/v2', authRoutes);
app.use('/api/v2', videoRoutes);
app.use('/api/v2', audioRoutes);
app.use('/api/v2', categoryRoutes);
app.use('/api/v2', castRoutes);
app.use('/api/v2', favouriteRoutes);
app.use('/api/v2', watchLaterRoutes);
app.use('/api/v2', playlistRoutes);
app.use('/api/v2', planRoutes);
app.use('/api/v2', paymentRoutes);
app.use('/api/v2', notificationRoutes);
app.use('/api/v2', siteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve Flutter web build — static files
const flutterWebPath = path.join(__dirname, '..', 'build', 'web');
app.use(express.static(flutterWebPath));

// Unmatched API routes — return clean 404 instead of hanging
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(flutterWebPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Media Jungle running on http://0.0.0.0:${PORT}`);
  console.log(`API base: http://172.20.10.2:${PORT}/api/v2`);
  console.log(`Flutter web: http://172.20.10.2:${PORT}`);
});

// Wear OS media-control relay — bridges watches with player clients
// (mobile app + website). Watches connect to ws://<host>:8080?role=watch.
startRelayServer();
