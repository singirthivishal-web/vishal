import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  successProbability: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  missingKeywords: [{
    type: String
  }],
  formattingIssues: [{
    type: String
  }],
  strengths: [{
    type: String
  }],
  skillsData: [{
    subject: String,
    score: Number
  }],
  analyzedAt: {
    type: Date,
    default: Date.now
  }
});

const Analysis = mongoose.model('Analysis', analysisSchema);
export default Analysis;
