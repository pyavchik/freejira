import express from 'express';
import {
  register,
  login,
  getMe,
  validateRegister,
  validateLogin,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

export default router;

