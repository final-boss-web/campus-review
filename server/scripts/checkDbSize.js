import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';

dotenv.config();

const checkSizes = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log('MongoDB Connected...');

    const hostels = await Hostel.find().lean();
    console.log(`Found ${hostels.length} hostels.`);
    hostels.forEach((h, idx) => {
      console.log(`Hostel ${idx + 1}: ${h.name}`);
      console.log(`- Images count: ${h.images?.length || 0}`);
      h.images?.forEach((img, imgIdx) => {
        const urlLen = img.url?.length || 0;
        console.log(`  - Image ${imgIdx + 1} URL Length: ${urlLen} characters (${(urlLen / 1024 / 1024).toFixed(2)} MB)`);
      });
    });

    const messes = await Mess.find().lean();
    console.log(`Found ${messes.length} messes.`);
    messes.forEach((m, idx) => {
      console.log(`Mess ${idx + 1}: ${m.name}`);
      console.log(`- Images count: ${m.images?.length || 0}`);
    });

    const shops = await Shop.find().lean();
    console.log(`Found ${shops.length} shops.`);
    shops.forEach((s, idx) => {
      console.log(`Shop ${idx + 1}: ${s.name}`);
      console.log(`- Images count: ${s.images?.length || 0}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkSizes();
