import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const testBcrypt = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    console.error('Please provide a plain text password and a hashed password.');
    process.exit(1);
  }

  console.log('Plain password provided:', plainPassword);
  console.log('Hashed password provided:', hashedPassword);

  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

  console.log('bcrypt.compare result:', isMatch);

  if (isMatch) {
    console.log('Password comparison successful!');
  } else {
    console.log('Password comparison failed.');
  }

  process.exit(0);
};

const plainPassword = process.argv[2];
const hashedPassword = process.argv[3];

testBcrypt(plainPassword, hashedPassword);
