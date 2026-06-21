require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const connectDB  = require('./config/db');
const { logError } = require('./services/errorLogger');

const commentRoutes  = require('./routes/comments');
const adminRoutes    = require('./routes/admin');
const statsRoutes    = require('./routes/stats');
const authRoutes     = require('./routes/auth');
const favoriteRoutes = require('./routes/favorites');

const app = express();

app.set('trust proxy', 1);

connectDB();

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL]
      : ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'];

    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('CORS: Origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/comments',  commentRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/stats',     statsRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/favorites', favoriteRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  logError('server.globalHandler', err, { url: req.url, method: req.method });
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
