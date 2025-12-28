import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';
import crypto from 'crypto';

export const registerUser = async (userData) => {
  const { name, email, password, acceptedTerms } = userData;

  // Validate terms acceptance
  if (!acceptedTerms) {
    throw new Error('You must accept Terms and Conditions to register');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    acceptedTerms: true,
  });

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      acceptedTerms: user.acceptedTerms,
    },
    token,
    refreshToken,
  };
};

export const loginUser = async (email, password) => {
  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      acceptedTerms: user.acceptedTerms,
    },
    token,
    refreshToken,
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const googleLoginUser = async (idToken) => {
  // Verify the token with Google
  const payload = await verifyGoogleToken(idToken);

  const { sub: googleId, email, name, picture } = payload;

  // Check if user exists
  let user = await User.findOne({
    $or: [
      { email },
      { providerId: googleId }
    ]
  });

  if (user) {
    // Update user if they don't have Google provider set
    if (user.provider !== 'google') {
      user.provider = 'google';
      user.providerId = googleId;
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    }
  } else {
    // Create new user (no password needed for OAuth users)
    user = await User.create({
      name,
      email,
      provider: 'google',
      providerId: googleId,
      avatar: picture || '',
      acceptedTerms: false, // OAuth users must accept terms post-registration
      // No password field - it's optional for OAuth users
    });
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      acceptedTerms: user.acceptedTerms,
    },
    token,
    refreshToken,
  };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists for security
    return { message: 'If that email exists, a password reset link has been sent.' };
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Don't throw - we still want to return success message for security
  }

  return {
    message: 'If that email exists, a password reset link has been sent.',
    resetToken: resetToken,
  };
};

export const resetPassword = async (resetToken, password) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      acceptedTerms: user.acceptedTerms,
    },
    token,
    refreshToken,
  };
};

export const acceptTerms = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Update acceptedTerms to true
  user.acceptedTerms = true;
  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      acceptedTerms: user.acceptedTerms,
    },
  };
};

