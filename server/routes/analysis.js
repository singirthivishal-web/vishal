import express from 'express';
import Analysis from '../models/Analysis.js';
import Resume from '../models/Resume.js';

const router = express.Router();

// Trigger an analysis for a resume
router.post('/analyze/:resumeId', async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // MOCK ANALYSIS LOGIC (Simulating AI processing)
    // In production, you would extract text using pdf.js and send it to OpenAI here
    const mockAnalysis = new Analysis({
      resume: resumeId,
      overallScore: Math.floor(Math.random() * 30) + 60, // 60-90 score
      successProbability: Math.floor(Math.random() * 20) + 65,
      missingKeywords: ['Agile', 'CI/CD', 'GraphQL', 'Docker', 'AWS'],
      formattingIssues: [
        'Complex table structures detected (ATS may fail to parse)',
        'Non-standard font used in header'
      ],
      strengths: [
        'Clear quantifiable metrics in recent experience',
        'Good action verbs used (Developed, Spearheaded)'
      ],
      skillsData: [
        { subject: 'React', score: 90 },
        { subject: 'Node.js', score: 85 },
        { subject: 'System Design', score: 70 }
      ]
    });

    await mockAnalysis.save();

    // Link analysis to resume
    resume.analysis = mockAnalysis._id;
    await resume.save();

    res.status(201).json({
      message: 'Analysis complete',
      analysis: mockAnalysis
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analysis results
router.get('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).populate('resume');
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
