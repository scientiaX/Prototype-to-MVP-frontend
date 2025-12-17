import express from 'express';
import UserProfile from '../models/UserProfile.js';
import { calculateProfile } from '../services/profileService.js';

const router = express.Router();

router.post('/calibrate', async (req, res) => {
  try {
    const { user_id, email, answers, language } = req.body;

    if (!user_id || !email || !answers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const calculatedProfile = calculateProfile(answers);
    
    let profile = await UserProfile.findOne({ user_id });
    
    if (profile) {
      Object.assign(profile, calculatedProfile);
      profile.language = language || 'id';
      await profile.save();
    } else {
      profile = await UserProfile.create({
        user_id,
        email,
        language: language || 'id',
        ...calculatedProfile
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Calibration error:', error);
    res.status(500).json({ error: 'Failed to calibrate profile' });
  }
});

router.get('/:user_id', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user_id: req.params.user_id });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/:user_id', async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { user_id: req.params.user_id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/', async (req, res) => {
  try {
    const profiles = await UserProfile.find()
      .sort({ total_arenas_completed: -1, 'xp_risk_taker': -1 })
      .limit(100);

    res.json(profiles);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Failed to get profiles' });
  }
});

export default router;
