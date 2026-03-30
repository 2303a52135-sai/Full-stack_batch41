/**
 * Outfit Controller
 * Create and manage complete outfits
 */

const Outfit = require('../models/Outfit');
const ClothingItem = require('../models/ClothingItem');
const User = require('../models/User');

// ─── GET /api/outfits ──────────────────────────────────────────────────────
const getOutfits = async (req, res, next) => {
  try {
    const { occasion, season, sort, page = 1, limit = 12 } = req.query;
    const filter = { user: req.user._id, isActive: true };

    if (occasion) filter.occasion = { $in: [occasion] };
    if (season) filter.season = { $in: [season] };

    let sortObj = { createdAt: -1 };
    if (sort === 'wearCount') sortObj = { wearCount: -1 };
    if (sort === 'rating') sortObj = { rating: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [outfits, total] = await Promise.all([
      Outfit.find(filter)
        .populate('items.item', 'name image category color')
        .sort(sortObj).skip(skip).limit(parseInt(limit)),
      Outfit.countDocuments(filter),
    ]);

    res.json({ success: true, count: outfits.length, total, data: outfits });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/outfits/:id ──────────────────────────────────────────────────
const getOutfit = async (req, res, next) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.item');
    if (!outfit) return res.status(404).json({ success: false, message: 'Outfit not found.' });
    res.json({ success: true, data: outfit });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/outfits ─────────────────────────────────────────────────────
const createOutfit = async (req, res, next) => {
  try {
    const { name, description, items, occasion, season, tags, rating } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Outfit must have at least one item.' });
    }

    // Verify all items belong to user
    const itemIds = items.map(i => i.item || i);
    const validItems = await ClothingItem.find({
      _id: { $in: itemIds },
      user: req.user._id,
      isActive: true,
    });

    if (validItems.length !== itemIds.length) {
      return res.status(400).json({ success: false, message: 'One or more items are invalid.' });
    }

    // Get cover image from first item
    const firstItem = validItems[0];
    const coverImage = firstItem.image?.url || '';

    const outfit = await Outfit.create({
      user: req.user._id,
      name, description,
      items: items.map(i => ({
        item: i.item || i,
        position: i.position || 'top',
      })),
      occasion: Array.isArray(occasion) ? occasion : [occasion || 'casual'],
      season: Array.isArray(season) ? season : [season || 'all-season'],
      coverImage, tags, rating,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalOutfits': 1 } });

    const populated = await Outfit.findById(outfit._id).populate('items.item', 'name image category color');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/outfits/:id ──────────────────────────────────────────────────
const updateOutfit = async (req, res, next) => {
  try {
    let outfit = await Outfit.findOne({ _id: req.params.id, user: req.user._id });
    if (!outfit) return res.status(404).json({ success: false, message: 'Outfit not found.' });

    outfit = await Outfit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('items.item', 'name image category color');

    res.json({ success: true, data: outfit });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/outfits/:id ───────────────────────────────────────────────
const deleteOutfit = async (req, res, next) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user._id });
    if (!outfit) return res.status(404).json({ success: false, message: 'Outfit not found.' });

    await Outfit.findByIdAndUpdate(req.params.id, { isActive: false });
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.totalOutfits': -1 } });

    res.json({ success: true, message: 'Outfit deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/outfits/:id/wear ────────────────────────────────────────────
const logOutfitWear = async (req, res, next) => {
  try {
    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $inc: { wearCount: 1 }, $set: { lastWorn: new Date() }, $push: { wearHistory: new Date() } },
      { new: true }
    );
    if (!outfit) return res.status(404).json({ success: false, message: 'Outfit not found.' });

    // Also increment wear count for each item in the outfit
    const itemIds = outfit.items.map(i => i.item);
    await ClothingItem.updateMany(
      { _id: { $in: itemIds } },
      { $inc: { wearCount: 1 }, $set: { lastWorn: new Date() }, $push: { wearHistory: new Date() } }
    );

    res.json({ success: true, data: outfit });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/outfits/:id/favorite ──────────────────────────────────────
const toggleFavorite = async (req, res, next) => {
  try {
    const outfit = await Outfit.findOne({ _id: req.params.id, user: req.user._id });
    if (!outfit) return res.status(404).json({ success: false, message: 'Outfit not found.' });
    outfit.isFavorite = !outfit.isFavorite;
    await outfit.save();
    res.json({ success: true, isFavorite: outfit.isFavorite });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOutfits, getOutfit, createOutfit, updateOutfit, deleteOutfit, logOutfitWear, toggleFavorite };
