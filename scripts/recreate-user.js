import mongoose from 'mongoose';
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

const recreateUser = async (email, name, password) => {
  if (!email || !name || !password) {
    console.error('Please provide an email, name, and a new password.');
    process.exit(1);
  }

  await connectDB();

  await User.deleteOne({ email });
  console.log(`User with email ${email} deleted.`);

  await User.create({
    name,
    email,
    password,
    acceptedTerms: true,
  });

  console.log(`User with email ${email} has been recreated.`);
  process.exit(0);
};

const email = process.argv[2];
const name = process.argv[3];
const password = process.argv[4];

recreateUser(email, name, password);
