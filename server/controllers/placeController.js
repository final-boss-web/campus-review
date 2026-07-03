import mongoose from 'mongoose';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';
import Review from '../models/Review.js';
import logger from '../config/logger.js';
import { io } from '../index.js'; // to emit socket events
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Helper to map type to model
const getModelByType = (type) => {
  switch (type?.toLowerCase()) {
    case 'hostel':
      return Hostel;
    case 'mess':
      return Mess;
    case 'shop':
      return Shop;
    default:
      return null;
  }
};

const findPlaceByIdOrSlug = (Model, idOrSlug) => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    return Model.findById(idOrSlug);
  }
  return Model.findOne({ slug: idOrSlug });
};

export const getPlaces = async (req, res, next) => {
  try {
    const {
      type, // 'Hostel', 'Mess', 'Shop'
      search,
      category, // for shops (e.g. 'Cafe', 'Restaurant')
      rating,
      minPrice,
      maxPrice,
      gender, // for hostels ('boys', 'girls', 'any')
      ac, // boolean for hostels
      wifi, // boolean for hostels
      laundry, // boolean for hostels
      washing, // boolean for hostels
      messAvailable, // boolean for hostels
      veg, // boolean for mess
      nonVeg, // boolean for mess
      approvedOnly = 'true',
    } = req.query;

    const queryFilters = {};
    if (approvedOnly === 'true') {
      queryFilters.approved = true;
    }

    // Search query
    if (search) {
      queryFilters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
      if (type?.toLowerCase() === 'hostel') {
        queryFilters.$or.push({ ownerName: { $regex: search, $options: 'i' } });
      }
    }

    // Category filter (Shops only)
    if (category && type?.toLowerCase() === 'shop') {
      queryFilters.category = category;
    }

    // Rating filter
    if (rating) {
      queryFilters.averageRating = { $gte: parseFloat(rating) };
    }

    // Rent / Monthly charges filtering
    if (minPrice || maxPrice) {
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Infinity;

      if (type?.toLowerCase() === 'hostel') {
        queryFilters.roomRent = { $gte: min, $lte: max };
      } else if (type?.toLowerCase() === 'mess') {
        queryFilters.monthlyCharges = { $gte: min, $lte: max };
      }
    }

    // Hostel specific filters
    if (type?.toLowerCase() === 'hostel') {
      if (ac === 'true') queryFilters.ac = true;
      if (wifi === 'true') queryFilters.wifi = true;
      if (laundry === 'true') queryFilters.laundry = true;
      if (washing === 'true') queryFilters.washing = true;
      if (messAvailable === 'true') queryFilters.messAvailable = true;
      
      // Supporting gender restrictions (e.g. boys hostel or girls hostel based on description or tags)
      if (gender === 'boys') {
        queryFilters.$or = queryFilters.$or || [];
        queryFilters.$or.push(
          { name: { $regex: 'boys', $options: 'i' } },
          { description: { $regex: 'boys', $options: 'i' } }
        );
      } else if (gender === 'girls') {
        queryFilters.$or = queryFilters.$or || [];
        queryFilters.$or.push(
          { name: { $regex: 'girls', $options: 'i' } },
          { description: { $regex: 'girls', $options: 'i' } }
        );
      }
    }

    // Mess specific filters
    if (type?.toLowerCase() === 'mess') {
      if (veg === 'true') queryFilters.veg = true;
      if (nonVeg === 'true') queryFilters.nonVeg = true;
    }

    // Query collections
    if (type) {
      const Model = getModelByType(type);
      if (!Model) {
        return res.status(400).json({ message: 'Invalid place type requested.' });
      }
      const data = await Model.find(queryFilters).sort({ createdAt: -1 });
      return res.status(200).json(data);
    }

    // Combined query if type is not specified
    const hostels = await Hostel.find(queryFilters).limit(10);
    const messes = await Mess.find(queryFilters).limit(10);
    const shops = await Shop.find(queryFilters).limit(10);

    return res.status(200).json({
      hostels,
      messes,
      shops,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlaceDetail = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = getModelByType(type);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid place type specified.' });
    }

    const place = await findPlaceByIdOrSlug(Model, id).populate('createdBy', 'name email avatar');
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    // Fetch related reviews using the populated MongoDB ID
    const reviews = await Review.find({ placeId: place._id, placeType: Model.modelName, isVerified: true })
      .populate('author', 'name email avatar badges')
      .sort({ createdAt: -1 });

    res.status(200).json({
      place,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createPlace = async (req, res, next) => {
  try {
    const { type } = req.body;
    const Model = getModelByType(type);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid place type specified.' });
    }

    const isUserAdmin = req.user.role === 'admin';
    const placeData = {
      ...req.body,
      createdBy: req.user._id,
      approved: isUserAdmin, // Autp-approve only if created by admin
    };

    const newPlace = await Model.create(placeData);
    logger.info(`New place submitted: ${newPlace.name} (${type}) by ${req.user.email}`);

    // If auto-approved, notify users via socket or store system notifications
    if (newPlace.approved) {
      const typeMap = { hostel: 'new_hostel', mess: 'new_mess', shop: 'new_shop' };
      const notificationType = typeMap[type.toLowerCase()];

      // Broadcast new place creation
      if (io) {
        io.emit('new_place', {
          id: newPlace._id,
          name: newPlace.name,
          type,
          message: `A new ${type.toLowerCase()} has been verified: ${newPlace.name}!`,
        });
      }
    }

    res.status(201).json({
      message: newPlace.approved
        ? 'Listing created and published successfully.'
        : 'Listing submitted for Admin review.',
      place: newPlace,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlace = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = getModelByType(type);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid place type specified.' });
    }

    const place = await findPlaceByIdOrSlug(Model, id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    // Require admin or ownership to update
    if (req.user.role !== 'admin' && place.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own listings.' });
    }

    // Use save() so Mongoose validators and pre-save hooks (like slug generation) run
    Object.assign(place, req.body);
    const updatedPlace = await place.save();
    logger.info(`Place updated: ${updatedPlace.name} by ${req.user.email}`);

    res.status(200).json({
      message: 'Place updated successfully.',
      place: updatedPlace,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlace = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = getModelByType(type);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid place type specified.' });
    }

    const place = await findPlaceByIdOrSlug(Model, id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    await Model.findByIdAndDelete(place._id);
    logger.warn(`Place deleted: ${place.name} (${type}) by admin ${req.user.email}`);

    // Delete all associated reviews
    await Review.deleteMany({ placeId: place._id, placeType: Model.modelName });

    res.status(200).json({ message: 'Place and all its reviews deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const approvePlace = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const Model = getModelByType(type);

    if (!Model) {
      return res.status(400).json({ message: 'Invalid place type specified.' });
    }

    const place = await findPlaceByIdOrSlug(Model, id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    place.approved = true;
    await place.save();

    logger.info(`Listing approved: ${place.name} by admin ${req.user.email}`);

    // Create system notification for listing creator
    const typeMap = { hostel: 'new_hostel', mess: 'new_mess', shop: 'new_shop' };
    const notificationType = typeMap[type.toLowerCase()];

    await Notification.create({
      recipient: place.createdBy,
      type: notificationType,
      message: `Your listing submission for "${place.name}" has been approved and published!`,
      referenceId: place._id,
      referenceType: Model.modelName,
    });

    if (io) {
      io.to(place.createdBy.toString()).emit('notification', {
        message: `Your listing submission for "${place.name}" has been approved!`,
      });
      io.emit('new_place', {
        id: place._id,
        name: place.name,
        type,
        message: `A new ${type.toLowerCase()} has been verified: ${place.name}!`,
      });
    }

    res.status(200).json({
      message: 'Listing approved successfully.',
      place,
    });
  } catch (error) {
    next(error);
  }
};

export const addPlaceImages = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { images } = req.body; // Array of { url, fileId, thumbnailUrl }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'No images provided.' });
    }

    const Model = getModelByType(type);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid place type specified.' });
    }

    const place = await findPlaceByIdOrSlug(Model, id);
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    // Append new images to the existing images array
    place.images = [...(place.images || []), ...images];
    const updatedPlace = await place.save();

    logger.info(`Added ${images.length} images to ${place.name} by ${req.user.email}`);

    res.status(200).json({
      message: 'Images added successfully.',
      images: updatedPlace.images
    });
  } catch (error) {
    next(error);
  }
};
