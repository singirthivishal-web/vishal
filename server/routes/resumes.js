import express from 'express';
import upload from '../middleware/upload.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';

const router = express.Router();

// Upload a new resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file format' });
    }

    // In a real app, you would get userId from the authenticated session/token
    // For now, we expect it in the body (or we can use a dummy user ID if none provided)
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const newResume = new Resume({
      user: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      // parsedText would be populated here or by a background job using pdfjs
    });

    await newResume.save();

    // Link resume to user
    await User.findByIdAndUpdate(userId, {
      $push: { resumes: newResume._id }
    });

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: newResume
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific resume metadata
router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('analysis');
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
