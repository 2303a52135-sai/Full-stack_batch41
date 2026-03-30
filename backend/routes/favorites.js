const express = require('express');
const { protect } = require('../middleware/auth');
const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');
const router = express.Router();

router.use(protect);

// GET /api/favorites - Get all favorited items and outfits
router.get('/', async (req, res, next) => {
  try {
    const [items, outfits] = await Promise.all([
      ClothingItem.find({ user: req.user._id, isFavorite: true, isActive: true }).lean(),
      Outfit.find({ user: req.user._id, isFavorite: true, isActive: true })
        .populate('items.item', 'name image category color').lean(),
    ]);
    res.json({ success: true, data: { items, outfits } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
