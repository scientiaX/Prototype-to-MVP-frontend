import express from 'express';
import Problem from '../models/Problem.js';
import { generateProblem } from '../services/aiService.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { profile, customization, user_id } = req.body;

    if (!profile || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const generatedProblem = await generateProblem(profile, customization);
    
    const problem = await Problem.create({
      ...generatedProblem,
      created_by: user_id,
      is_active: true
    });

    res.json(problem);
  } catch (error) {
    console.error('Generate problem error:', error);
    res.status(500).json({ error: 'Failed to generate problem' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { difficulty_min, difficulty_max, is_active = true } = req.query;
    
    const filter = { is_active };
    
    if (difficulty_min || difficulty_max) {
      filter.difficulty = {};
      if (difficulty_min) filter.difficulty.$gte = parseInt(difficulty_min);
      if (difficulty_max) filter.difficulty.$lte = parseInt(difficulty_max);
    }

    const problems = await Problem.find(filter).sort({ createdAt: -1 });

    res.json(problems);
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Failed to get problems' });
  }
});

router.get('/:problem_id', async (req, res) => {
  try {
    const problem = await Problem.findOne({ problem_id: req.params.problem_id });
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json(problem);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Failed to get problem' });
  }
});

export default router;
