import mongoose from 'mongoose';

const arenaSessionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  problem_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'evaluated', 'abandoned'],
    default: 'in_progress'
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  submitted_at: {
    type: Date
  },
  difficulty_at_start: {
    type: Number,
    required: true
  },
  archetype_at_start: {
    type: String,
    required: true
  },
  solution_text: {
    type: String
  },
  xp_earned: {
    type: Number,
    default: 0
  },
  xp_breakdown: {
    risk_taker: { type: Number, default: 0 },
    analyst: { type: Number, default: 0 },
    builder: { type: Number, default: 0 },
    strategist: { type: Number, default: 0 }
  },
  level_up_achieved: {
    type: Boolean,
    default: false
  },
  criteria_met: [{
    type: String
  }],
  ai_evaluation: {
    type: String
  },
  ai_insight: {
    type: String
  },
  time_spent_seconds: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('ArenaSession', arenaSessionSchema);
