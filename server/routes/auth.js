import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ── Google Strategy ────────────────────────────────────────────────────────
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find user by googleId or email
      let user = await User.findOne({ 
        $or: [
          { googleId: profile.id },
          { email: profile.emails?.[0]?.value }
        ]
      });

      if (user) {
        // Link googleId if found by email
        if (!user.googleId) {
          user.googleId = profile.id;
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
        }
      } else {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// ── LinkedIn Strategy ──────────────────────────────────────────────────────
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID || 'placeholder',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'placeholder',
    callbackURL: '/api/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({
        $or: [
          { linkedinId: profile.id },
          { email: profile.emails?.[0]?.value }
        ]
      });

      if (user) {
        if (!user.linkedinId) {
          user.linkedinId = profile.id;
          if (!user.avatar && profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
        }
      } else {
        user = await User.create({
          linkedinId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// ── Routes ─────────────────────────────────────────────────────────────────

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);

// LinkedIn Auth
router.get('/linkedin', passport.authenticate('linkedin', { state: true }));

router.get('/linkedin/callback', 
  passport.authenticate('linkedin', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);

// Get current user (Verify Token)
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
