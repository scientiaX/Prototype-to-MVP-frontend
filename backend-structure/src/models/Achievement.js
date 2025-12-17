import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  achievement_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  archetype_at_achievement: {
    type: String,
    enum: ['risk_taker', 'analyst', 'builder', 'strategist']
  },
  difficulty_level: {
    type: Number,
    min: 1,
    max: 10
  },
  problem_id: {
    type: String
  },
  achieved_at: {
    type: Date,
    default: Date.now
  },
  badge_type: {
    type: String,
    enum: ['difficulty_jump', 'archetype_mastery', 'speed', 'consistency', 'special'],
    default: 'difficulty_jump'
  },
  is_highest: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Achievement', achievementSchema);
