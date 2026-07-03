import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixGoogleIndex = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error('MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    await mongoose.connect(connStr);
    console.log('MongoDB Connected for Index Fix...');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes on users collection:', indexes.map(idx => idx.name));

    // Check if googleId_1 exists
    const hasGoogleIndex = indexes.some(idx => idx.name === 'googleId_1');

    if (hasGoogleIndex) {
      console.log('Dropping old index googleId_1...');
      await collection.dropIndex('googleId_1');
      console.log('Dropped index googleId_1 successfully.');
    }

    // Re-create the index as unique and sparse
    console.log('Creating new sparse and unique index for googleId...');
    await collection.createIndex({ googleId: 1 }, { unique: true, sparse: true, name: 'googleId_1' });
    console.log('GoogleId sparse index created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error fixing index:', error);
    process.exit(1);
  }
};

fixGoogleIndex();
