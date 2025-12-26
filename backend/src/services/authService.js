import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { verifyGoogleToken } from '../utils/googleAuth.js';

export const registerUser = async (userData) => {
  const { name, email, password } = userData;

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
    // Create new user
    user = await User.create({
      name,
      email,
      provider: 'google',
      providerId: googleId,
      avatar: picture || '',
      password: Math.random().toString(36).slice(-8), // Random password for OAuth users
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
    },
    token,
    refreshToken,
  };
};

