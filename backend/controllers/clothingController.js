/**
 * Clothing Controller
 * Full CRUD for wardrobe clothing items
 */

const ClothingItem = require('../models/ClothingItem');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// ─── GET /api/clothing ─────────────────────────────────────────────────────
// Get all clothing items for logged-in user with filtering & pagination
const getClothingItems = async (req, res, next) => {
  try {
    const { category, color, occasion, season, search, sort, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filter = { user: req.user._id, isActive: true };

    if (category) filter.category = category;
    if (color) filter.color = { $regex: color, $options: 'i' };
    if (occasion) filter.occasion = { $in: [occasion] };
    if (season) filter.season = { $in: [season] };

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Sorting
    let sortObj = { createdAt: -1 }; // default: newest first
    if (sort === 'name') sortObj = { name: 1 };
    if (sort === 'wearCount') sortObj = { wearCount: -1 };
    if (sort === 'lastWorn') sortObj = { lastWorn: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      ClothingItem.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      ClothingItem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/clothing/:id ─────────────────────────────────────────────────
const getClothingItem = async (req, res, next) => {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/clothing ────────────────────────────────────────────────────
const createClothingItem = async (req, res, next) => {
  try {
    const {
      name, category, subcategory, color, colors, brand,
      occasion, season, material, size, purchaseDate,
      purchasePrice, notes, tags,
    } = req.body;

    // Handle image upload
    let image = { url: '', publicId: '' };
    if (req.file) {
      // Cloudinary upload
      if (req.file.path && req.file.filename) {
        image = { url: req.file.path, publicId: req.file.filename };
      } else {
        // Local storage
        image = { url: `/uploads/${req.file.filename}`, publicId: req.file.filename };
      }
    }

    const item = await ClothingItem.create({
      user: req.user._id,
      name, category, subcategory, color,
      colors: colors ? (Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim())) : [],
      brand, occasion: Array.isArray(occasion) ? occasion : [occasion],
      season: Array.isArray(season) ? season : [season],
      material, size, purchaseDate, purchasePrice, notes,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      image,
    });

    // Update user's total item count
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalItems': 1 } });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/clothing/:id ─────────────────────────────────────────────────
const updateClothingItem = async (req, res, next) => {
  try {
    let item = await ClothingItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (item.image.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
        await cloudinary.uploader.destroy(item.image.publicId);
      }
      req.body.image = req.file.path
        ? { url: req.file.path, publicId: req.file.filename }
        : { url: `/uploads/${req.file.filename}`, publicId: req.file.filename };
    }

    // Parse arrays if they come as strings
    if (req.body.occasion && !Array.isArray(req.body.occasion)) {
      req.body.occasion = [req.body.occasion];
    }
    if (req.body.season && !Array.isArray(req.body.season)) {
      req.body.season = [req.body.season];
    }

    item = await ClothingItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/clothing/:id ──────────────────────────────────────────────
const deleteClothingItem = async (req, res, next) => {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    // Delete image from Cloudinary
    if (item.image.publicId && process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }

    // Soft delete
    await ClothingItem.findByIdAndUpdate(req.params.id, { isActive: false });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalItems': -1 } });

    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/clothing/:id/wear ───────────────────────────────────────────
// Log that an item was worn today
const logWear = async (req, res, next) => {
  try {
    const item = await ClothingItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        $inc: { wearCount: 1 },
        $set: { lastWorn: new Date() },
        $push: { wearHistory: new Date() },
      },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/clothing/stats ───────────────────────────────────────────────
// Analytics: most/least worn, category breakdown
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      categoryBreakdown,
      mostWorn,
      leastWorn,
      neverWorn,
      seasonBreakdown,
      occasionBreakdown,
    ] = await Promise.all([
      ClothingItem.aggregate([
        { $match: { user: userId, isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ClothingItem.find({ user: userId, isActive: true }).sort({ wearCount: -1 }).limit(5).select('name image wearCount category color'),
      ClothingItem.find({ user: userId, isActive: true, wearCount: { $gt: 0 } }).sort({ wearCount: 1 }).limit(5).select('name image wearCount category color'),
      ClothingItem.countDocuments({ user: userId, isActive: true, wearCount: 0 }),
      ClothingItem.aggregate([
        { $match: { user: userId, isActive: true } },
        { $unwind: '$season' },
        { $group: { _id: '$season', count: { $sum: 1 } } },
      ]),
      ClothingItem.aggregate([
        { $match: { user: userId, isActive: true } },
        { $unwind: '$occasion' },
        { $group: { _id: '$occasion', count: { $sum: 1 } } },
      ]),
    ]);

    const total = await ClothingItem.countDocuments({ user: userId, isActive: true });

    res.json({
      success: true,
      data: { total, categoryBreakdown, mostWorn, leastWorn, neverWorn, seasonBreakdown, occasionBreakdown },
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/clothing/:id/favorite ─────────────────────────────────────
const toggleFavorite = async (req, res, next) => {
  try {
    const item = await ClothingItem.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    item.isFavorite = !item.isFavorite;
    await item.save();

    res.json({ success: true, isFavorite: item.isFavorite, data: item });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClothingItems,
  getClothingItem,
  createClothingItem,
  updateClothingItem,
  deleteClothingItem,
  logWear,
  getStats,
  toggleFavorite,
};
