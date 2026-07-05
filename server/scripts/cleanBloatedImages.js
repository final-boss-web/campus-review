import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';

dotenv.config();

const cleanBloat = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log('MongoDB Connected to clean bloated base64 images...');

    const fallbackHostel = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600';
    const fallbackMess = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600';
    const fallbackShop = 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600';

    // 1. Clean Hostels
    const hostels = await Hostel.find();
    for (const h of hostels) {
      let modified = false;
      if (h.images && h.images.length > 0) {
        h.images = h.images.map((img) => {
          if (img.url && img.url.startsWith('data:image/') && img.url.length > 100000) {
            console.log(`Cleaning bloated image in hostel: ${h.name} (${(img.url.length / 1024 / 1024).toFixed(2)} MB)`);
            modified = true;
            return {
              url: fallbackHostel,
              fileId: img.fileId || 'cleaned_img',
              thumbnailUrl: fallbackHostel
            };
          }
          return img;
        });
      }
      if (modified) {
        await h.save();
        console.log(`Saved hostel: ${h.name}`);
      }
    }

    // 2. Clean Messes
    const messes = await Mess.find();
    for (const m of messes) {
      let modified = false;
      if (m.images && m.images.length > 0) {
        m.images = m.images.map((img) => {
          if (img.url && img.url.startsWith('data:image/') && img.url.length > 100000) {
            console.log(`Cleaning bloated image in mess: ${m.name}`);
            modified = true;
            return {
              url: fallbackMess,
              fileId: img.fileId || 'cleaned_img',
              thumbnailUrl: fallbackMess
            };
          }
          return img;
        });
      }
      if (modified) {
        await m.save();
        console.log(`Saved mess: ${m.name}`);
      }
    }

    // 3. Clean Shops
    const shops = await Shop.find();
    for (const s of shops) {
      let modified = false;
      if (s.images && s.images.length > 0) {
        s.images = s.images.map((img) => {
          if (img.url && img.url.startsWith('data:image/') && img.url.length > 100000) {
            console.log(`Cleaning bloated image in shop: ${s.name}`);
            modified = true;
            return {
              url: fallbackShop,
              fileId: img.fileId || 'cleaned_img',
              thumbnailUrl: fallbackShop
            };
          }
          return img;
        });
      }
      if (modified) {
        await s.save();
        console.log(`Saved shop: ${s.name}`);
      }
    }

    console.log('Database image de-bloating completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

cleanBloat();
