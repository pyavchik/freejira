import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.use(protect);

// GET /api/users - list all users (basic info)
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({}, 'name email avatar role');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

export default router;

