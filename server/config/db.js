import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      logger.error('MONGODB_URI is not defined in the environment variables.');
      process.exit(1);
    }
    const conn = await mongoose.connect(connStr);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
