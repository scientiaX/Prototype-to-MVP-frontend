import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  problem_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  context: {
    type: String,
    required: true
  },
  objective: {
    type: String,
    required: true
  },
  constraints: [{
    type: String
  }],
  difficulty: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  level_up_criteria: [{
    type: String
  }],
  domain: {
    type: String,
    enum: ['business', 'tech', 'creative', 'leadership', 'mixed']
  },
  archetype_focus: {
    type: String,
    enum: ['risk_taker', 'analyst', 'builder', 'strategist', 'all']
  },
  estimated_time_minutes: {
    type: Number,
    default: 30
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Problem', problemSchema);
