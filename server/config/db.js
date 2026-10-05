const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoMemoryServer = null;

const seedInitialDataIfEmpty = async () => {
  // Demo auto-seeding disabled for real production database
  return;
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('CRITICAL ERROR: MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 45000,
      connectTimeoutMS: 45000,
      socketTimeoutMS: 45000
    });
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    await seedInitialDataIfEmpty();
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    console.error('Please verify that:');
    console.error('1. MongoDB Atlas Network Access has 0.0.0.0/0 (Allow Access from Anywhere) enabled.');
    console.error('2. MONGODB_URI is correctly configured in your environment variables.');
    process.exit(1);
  }
};

module.exports = { connectDB, seedInitialDataIfEmpty };

