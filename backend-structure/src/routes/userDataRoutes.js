import express from 'express';
import Achievement from '../models/Achievement.js';
import Artifact from '../models/Artifact.js';

const router = express.Router();

router.get('/achievements/:user_id', async (req, res) => {
  try {
    const achievements = await Achievement.find({ user_id: req.params.user_id })
      .sort({ achieved_at: -1 });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

router.get('/artifacts/:user_id', async (req, res) => {
  try {
    const artifacts = await Artifact.find({ user_id: req.params.user_id })
      .sort({ conquered_at: -1 });

    res.json(artifacts);
  } catch (error) {
    console.error('Get artifacts error:', error);
    res.status(500).json({ error: 'Failed to get artifacts' });
  }
});

export default router;
