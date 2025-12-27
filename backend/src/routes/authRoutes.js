import express from 'express';
import {
  register,
  login,
  getMe,
  googleLogin,
  forgotPasswordRequest,
  resetPasswordRequest,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleLogin);
router.post('/forgot-password', validateForgotPassword, forgotPasswordRequest);
router.post('/reset-password', validateResetPassword, resetPasswordRequest);
router.get('/me', protect, getMe);

export default router;

