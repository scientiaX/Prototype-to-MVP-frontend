import mongoose from 'mongoose';

const artifactSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  problem_id: {
    type: String,
    required: true
  },
  problem_title: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  },
  archetype_role: {
    type: String,
    enum: ['risk_taker', 'analyst', 'builder', 'strategist']
  },
  solution_summary: {
    type: String,
    required: true
  },
  insight: {
    type: String
  },
  level_up_verified: {
    type: Boolean,
    default: false
  },
  arena_session_id: {
    type: String,
    required: true
  },
  conquered_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Artifact', artifactSchema);
