import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';
import Review from '../models/Review.js';
import ScamReport from '../models/ScamReport.js';

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error('MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    await mongoose.connect(connStr);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Hostel.deleteMany({});
    await Mess.deleteMany({});
    await Shop.deleteMany({});
    await Review.deleteMany({});
    await ScamReport.deleteMany({});
    console.log('Cleared existing collections...');

    // 1. Create Users
    const adminUser = await User.create({
      googleId: 'mock_google_admin_id',
      name: 'Admin Vaibhav',
      email: 'admin@campus.edu',
      avatar: 'https://lh3.googleusercontent.com/a/AGNmyxZ',
      role: 'admin',
      status: 'active',
      badges: ['Campus Overseer', 'System Architect'],
    });

    const studentUser = await User.create({
      googleId: 'mock_google_student_id',
      name: 'Priya Sharma',
      email: 'student@campus.edu',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      role: 'student',
      status: 'active',
      badges: ['Active Reviewer', 'Scam Detector'],
    });

    const otherStudent = await User.create({
      googleId: 'mock_google_other_id',
      name: 'Rohan Gupta',
      email: 'rohan@campus.edu',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'student',
      status: 'active',
      badges: ['Campus Rookie'],
    });

    console.log('Created Users: Admin, Priya, Rohan');

    // 2. Create Hostels
    const hostel1 = await Hostel.create({
      name: 'Starlight Luxury Boys Hostel',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
          fileId: 'hostel_img_1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=150',
        },
      ],
      ownerName: 'Mr. Ramesh Prasad',
      phone: '+91 9876543210',
      googleMapsUrl: 'https://maps.google.com/?q=Starlight+Boys+Hostel',
      address: 'Lane 4, opposite Main Gate, Campus Area',
      roomRent: 6500,
      deposit: 10000,
      ac: true,
      nonAc: true,
      wifi: true,
      laundry: true,
      washing: true,
      parking: true,
      security: true,
      water: true,
      electricity: true,
      messAvailable: true,
      description: 'Starlight Hostel provides high-quality lodging for male students. Includes daily housekeeping, biometric high-security gate, high-speed optical fiber WiFi, and washing machines. Healthy food served 3 times a day.',
      averageRating: 4.5,
      ratingsCount: 2,
      nearbyDistance: 0.2,
      approved: true,
      createdBy: adminUser._id,
    });

    const hostel2 = await Hostel.create({
      name: 'Zenith Girls PG & Hostel',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600',
          fileId: 'hostel_img_2',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=150',
        },
      ],
      ownerName: 'Mrs. Shanti Devi',
      phone: '+91 9123456789',
      googleMapsUrl: 'https://maps.google.com/?q=Zenith+Girls+PG',
      address: 'Street No 2, Sector A, Near Central Library',
      roomRent: 5200,
      deposit: 5000,
      ac: false,
      nonAc: true,
      wifi: true,
      laundry: true,
      washing: true,
      parking: false,
      security: true,
      water: true,
      electricity: true,
      messAvailable: false,
      description: 'A safe and clean paying guest accommodation for female students. Located within walking distance of the university. Very quiet study environment, regular security guards, and backup water supply.',
      averageRating: 3.5,
      ratingsCount: 1,
      nearbyDistance: 0.5,
      approved: true,
      createdBy: studentUser._id,
    });

    console.log('Created Hostels: Starlight and Zenith');

    // 3. Create Messes
    const mess1 = await Mess.create({
      name: 'Annapurna Student Mess (Veg)',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
          fileId: 'mess_img_1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150',
        },
      ],
      menu: 'Mon: Roti, Sabji, Dal, Rice. Tue: Paneer Special. Wed: Aloo Paratha (Breakfast), Chole Rice (Lunch). Thu-Sun: Traditional North Indian Meals.',
      monthlyCharges: 2800,
      dailyCharges: 100,
      foodTiming: 'Breakfast: 8:00 AM - 9:30 AM | Lunch: 1:00 PM - 2:30 PM | Dinner: 8:00 PM - 9:30 PM',
      veg: true,
      nonVeg: false,
      contact: '+91 8888887777',
      address: 'Shop No. 12, Student Hub Complex',
      averageRating: 4.0,
      ratingsCount: 1,
      approved: true,
      createdBy: studentUser._id,
    });

    const mess2 = await Mess.create({
      name: 'Red Spice Kitchen (Veg & Non-Veg)',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1561719181-1155131a4975?w=600',
          fileId: 'mess_img_2',
          thumbnailUrl: 'https://images.unsplash.com/photo-1561719181-1155131a4975?w=150',
        },
      ],
      menu: 'Daily Veg meals with Chicken/Egg curry options on Wednesdays, Fridays, and Sundays. Fresh fish fry available on demand.',
      monthlyCharges: 3500,
      dailyCharges: 140,
      foodTiming: 'Lunch: 12:30 PM - 3:00 PM | Dinner: 7:30 PM - 10:00 PM',
      veg: true,
      nonVeg: true,
      contact: '+91 7777766666',
      address: 'Food Street, Lane B',
      averageRating: 4.8,
      ratingsCount: 1,
      approved: true,
      createdBy: adminUser._id,
    });

    console.log('Created Messes: Annapurna and Red Spice');

    // 4. Create Shops
    const shop1 = await Shop.create({
      name: 'Vidyarthi Book House & Xerox',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
          fileId: 'shop_img_1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150',
        },
      ],
      address: 'Main Market, near College Gate 2',
      phone: '+91 9999988888',
      openingTime: '08:00 AM',
      closingTime: '10:00 PM',
      location: 'Opposite State Bank ATM',
      category: 'Stationery & Photocopy',
      averageRating: 4.2,
      ratingsCount: 1,
      approved: true,
      createdBy: studentUser._id,
    });

    const shop2 = await Shop.create({
      name: 'Byte Cafe & Fast Food',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600',
          fileId: 'shop_img_2',
          thumbnailUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=150',
        },
      ],
      address: 'Science Block Alleyway',
      phone: '+91 9555544444',
      openingTime: '10:00 AM',
      closingTime: '11:30 PM',
      location: 'Behind Computer Lab Building',
      category: 'Restaurant & Cafe',
      averageRating: 4.7,
      ratingsCount: 1,
      approved: true,
      createdBy: adminUser._id,
    });

    console.log('Created Shops: Vidyarthi Book House and Byte Cafe');

    // 5. Create Reviews
    await Review.create({
      author: studentUser._id,
      placeId: hostel1._id,
      placeType: 'Hostel',
      rating: 5,
      reviewText: 'Absolutely loved staying here. The rooms are clean, WiFi speed is consistent (above 80 Mbps), and the warden is cooperative. The deposit refund is smooth when you vacate.',
      pros: 'High speed WiFi, biometric security, laundry machines work great.',
      cons: 'A bit expensive compared to other nearby options, water supply occasionally cut during cleaning hours.',
      cleanliness: 5,
      facilities: 5,
      internet: 5,
      safety: 5,
      behaviour: 4,
      price: 3,
      likes: [otherStudent._id],
      isVerified: true,
    });

    await Review.create({
      author: otherStudent._id,
      placeId: hostel1._id,
      placeType: 'Hostel',
      rating: 4,
      reviewText: 'Good infrastructure. Foods is decent but sometimes gets repetitive. Close proximity to the campus is the main advantage.',
      pros: 'Walking distance to campus, hot water geyser works in winters.',
      cons: 'Room size is a bit small for double sharing.',
      cleanliness: 4,
      facilities: 4,
      internet: 4,
      safety: 4,
      behaviour: 4,
      price: 4,
      likes: [],
      isVerified: true,
    });

    await Review.create({
      author: otherStudent._id,
      placeId: hostel2._id,
      placeType: 'Hostel',
      rating: 3,
      reviewText: 'Average PG. Security is tight but there are too many restrictions (no guests allowed, entry curfew is strictly 8:30 PM). Rent is fair.',
      pros: 'Safe for girls, decent rental price.',
      cons: 'Extremely strict timing restrictions, average laundry services.',
      cleanliness: 3,
      facilities: 3,
      internet: 3,
      safety: 5,
      behaviour: 2,
      price: 4,
      isVerified: true,
    });

    await Review.create({
      author: studentUser._id,
      placeId: mess1._id,
      placeType: 'Mess',
      rating: 4,
      reviewText: 'Clean food. Value for money. The owner is friendly and listens to food quality feedback.',
      pros: 'Fresh chapatis, unlimited rice.',
      cons: 'Heavy crowded during lunch hours (1 PM - 2 PM).',
      cleanliness: 4,
      food: 4,
      behaviour: 5,
      price: 4,
      isVerified: true,
    });

    await Review.create({
      author: otherStudent._id,
      placeId: mess2._id,
      placeType: 'Mess',
      rating: 5,
      reviewText: 'Hands down the best food in the campus area! The non-veg meals on Wednesdays are exceptional.',
      pros: 'Amazing chicken curry, menu variety.',
      cons: 'Slightly higher monthly charges.',
      cleanliness: 5,
      food: 5,
      behaviour: 4,
      price: 3,
      isVerified: true,
    });

    await Review.create({
      author: studentUser._id,
      placeId: shop1._id,
      placeType: 'Shop',
      rating: 4,
      reviewText: 'Reliable place to get printouts. They accept PDF transfers via WhatsApp. Rates are standard (1 rupee/page).',
      pros: 'Fast machines, bulk printing discount.',
      cons: 'Shop gets very stuffy during exam season.',
      cleanliness: 3,
      behaviour: 4,
      price: 5,
      isVerified: true,
    });

    await Review.create({
      author: studentUser._id,
      placeId: shop2._id,
      placeType: 'Shop',
      rating: 5,
      reviewText: 'Great place to study and code. Try their cold coffee and garlic bread, they are amazing!',
      pros: 'Aesthetic interior, power sockets near every table, friendly staff.',
      cons: 'Music is sometimes a bit too loud.',
      cleanliness: 5,
      behaviour: 5,
      price: 4,
      isVerified: true,
    });

    console.log('Created reviews and updated ratings counters.');

    // 6. Create Scam Report
    await ScamReport.create({
      student: studentUser._id,
      title: 'Advance Deposit Scam - Fake PG Owner',
      category: 'Deposit Scam',
      description: 'A person claiming to be the owner of Zenith PG contacted me on WhatsApp and sent pictures. He demanded an advance token deposit of 5,000 INR to book the room. Once the money was sent via UPI, he blocked my number. The actual PG warden confirmed no such booking existed. Beware of UPI transfers without visiting the PG in person!',
      proofImages: [
        {
          url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
          fileId: 'scam_bill_1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=150',
        },
      ],
      targetPlaceType: 'Hostel',
      targetPlaceId: hostel2._id,
      isVerifiedScam: true,
      verifiedBy: adminUser._id,
    });

    console.log('Created Verified Scam Report.');

    console.log('Database Seeding Completed successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
