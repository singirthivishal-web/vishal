import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all users (mock admin route)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user (mock registration)
router.post('/', async (req, res) => {
  try {
    const { name, email, targetRole, targetIndustry } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      targetRole,
      targetIndustry
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('resumes');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
