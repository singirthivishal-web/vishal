import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/career-os';

// ── CORS (allow Vite dev + Next.js dev) ───────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js
    'http://localhost:5173',  // Vite (legacy)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Passport Initialization ───────────────────────────────────────────────
app.use(passport.initialize());

// ── MongoDB Atlas ─────────────────────────────────────────────────────────
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
  retryWrites: true,
};

mongoose.connect(MONGO_URI, mongooseOptions)
  .then(() => {
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to MongoDB Atlas — database: "${dbName}"`);
  })
  .catch((err) => {
    console.error('❌ MongoDB Atlas connection failed:', err.message);
    console.warn('   Check your MONGO_URI and Atlas network access (allow 0.0.0.0/0 or your IP).');
  });

// ── Health ────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', message: 'CareerOS Express API running' }));

// ── Routes ────────────────────────────────────────────────────────────────
import userRoutes     from './routes/users.js';
import resumeRoutes   from './routes/resumes.js';
import analysisRoutes from './routes/analysis.js';
import authRoutes     from './routes/auth.js';

app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/resumes',  resumeRoutes);
app.use('/api/analysis', analysisRoutes);

// ── Resume Analysis Route (JS-based, no Python needed) ────────────────────
import analyzeResumeRoute from './routes/analyzeResume.js';
app.use('/api/analyze-resume', analyzeResumeRoute);

// ── Global Error Handler ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CareerOS Express server running on http://localhost:${PORT}`);
});
