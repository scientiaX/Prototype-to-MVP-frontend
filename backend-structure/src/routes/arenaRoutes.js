import express from 'express';
import ArenaSession from '../models/ArenaSession.js';
import UserProfile from '../models/UserProfile.js';
import Problem from '../models/Problem.js';
import Achievement from '../models/Achievement.js';
import Artifact from '../models/Artifact.js';
import { evaluateSolution } from '../services/aiService.js';
import { calculateXPDistribution, updateArchetype } from '../services/profileService.js';

const router = express.Router();

router.post('/start', async (req, res) => {
  try {
    const { user_id, problem_id } = req.body;

    if (!user_id || !problem_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const profile = await UserProfile.findOne({ user_id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const session = await ArenaSession.create({
      user_id,
      problem_id,
      status: 'in_progress',
      started_at: new Date(),
      difficulty_at_start: profile.current_difficulty,
      archetype_at_start: profile.primary_archetype
    });

    res.json(session);
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { session_id, solution, time_elapsed } = req.body;

    if (!session_id || !solution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await ArenaSession.findById(session_id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const problem = await Problem.findOne({ problem_id: session.problem_id });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const profile = await UserProfile.findOne({ user_id: session.user_id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const evaluation = await evaluateSolution(problem, solution, time_elapsed);

    const { totalXp, xpBreakdown } = calculateXPDistribution(evaluation, problem, profile);

    session.status = 'evaluated';
    session.submitted_at = new Date();
    session.solution_text = solution;
    session.xp_earned = totalXp;
    session.xp_breakdown = xpBreakdown;
    session.level_up_achieved = evaluation.level_up_achieved;
    session.criteria_met = evaluation.criteria_met;
    session.ai_evaluation = evaluation.evaluation;
    session.ai_insight = evaluation.insight;
    session.time_spent_seconds = time_elapsed;
    await session.save();

    profile.xp_risk_taker += xpBreakdown.risk_taker || 0;
    profile.xp_analyst += xpBreakdown.analyst || 0;
    profile.xp_builder += xpBreakdown.builder || 0;
    profile.xp_strategist += xpBreakdown.strategist || 0;
    profile.total_arenas_completed += 1;

    if (evaluation.level_up_achieved && problem.difficulty > profile.current_difficulty) {
      profile.current_difficulty = problem.difficulty;
      profile.highest_difficulty_conquered = Math.max(
        profile.highest_difficulty_conquered, 
        problem.difficulty
      );

      await Achievement.create({
        user_id: session.user_id,
        achievement_id: `ACH-${Date.now()}`,
        title: `Conquered Level ${problem.difficulty}`,
        description: `Menyelesaikan ${problem.title} di difficulty ${problem.difficulty}`,
        archetype_at_achievement: profile.primary_archetype,
        difficulty_level: problem.difficulty,
        problem_id: problem.problem_id,
        achieved_at: new Date(),
        badge_type: 'difficulty_jump',
        is_highest: problem.difficulty > profile.highest_difficulty_conquered
      });

      await Artifact.create({
        user_id: session.user_id,
        problem_id: problem.problem_id,
        problem_title: problem.title,
        difficulty: problem.difficulty,
        archetype_role: profile.primary_archetype,
        solution_summary: solution.substring(0, 500),
        insight: evaluation.insight,
        level_up_verified: true,
        arena_session_id: session._id.toString(),
        conquered_at: new Date()
      });
    }

    profile.primary_archetype = updateArchetype(profile);
    await profile.save();

    res.json({
      session,
      evaluation,
      xp_earned: totalXp,
      xp_breakdown: xpBreakdown,
      updated_profile: profile
    });
  } catch (error) {
    console.error('Submit session error:', error);
    res.status(500).json({ error: 'Failed to submit session' });
  }
});

router.post('/abandon', async (req, res) => {
  try {
    const { session_id } = req.body;

    const session = await ArenaSession.findByIdAndUpdate(
      session_id,
      { status: 'abandoned' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Abandon session error:', error);
    res.status(500).json({ error: 'Failed to abandon session' });
  }
});

router.get('/user/:user_id', async (req, res) => {
  try {
    const sessions = await ArenaSession.find({ user_id: req.params.user_id })
      .sort({ started_at: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

export default router;
