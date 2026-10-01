const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoMemoryServer = null;

const seedInitialDataIfEmpty = async () => {
  // Demo auto-seeding disabled for real production database
  return;
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isInvalidAtlasSql = uri && uri.includes('atlas-sql');

  if (uri && !isInvalidAtlasSql) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      await seedInitialDataIfEmpty();
      return;
    } catch (error) {
      console.warn(`Primary MongoDB connection failed (${error.message}). Falling back to local memory database...`);
    }
  }

  // Fallback to in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`⚡ In-Memory MongoDB Connected at: ${memoryUri}`);
    console.log(`💡 Tip: To persist data across server restarts, set a valid MONGODB_URI in server/.env`);
    await seedInitialDataIfEmpty();
  } catch (error) {
    console.error(`In-memory database error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, seedInitialDataIfEmpty };

