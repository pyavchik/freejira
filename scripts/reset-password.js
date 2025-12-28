import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../backend/src/models/User.js';

dotenv.config({ path: './backend/.env' });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const resetPassword = async (email, newPassword) => {
  if (!email || !newPassword) {
    console.error('Please provide an email and a new password.');
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ email });

  if (!user) {
    console.error('User not found.');
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  console.log(`Password for user ${email} has been successfully reset.`);
  process.exit(0);
};

const email = process.argv[2];
const newPassword = process.argv[3];

resetPassword(email, newPassword);
