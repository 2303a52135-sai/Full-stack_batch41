/**
 * Outfit Model
 * Represents a combination of clothing items as a complete outfit
 */

const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Outfit name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: { type: String, maxlength: 500 },

  // Array of clothing items in this outfit
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClothingItem',
      required: true,
    },
    position: { type: String, enum: ['top', 'bottom', 'shoes', 'accessory', 'outerwear', 'full-body'] },
  }],

  // Outfit metadata
  occasion: {
    type: [String],
    enum: ['casual', 'formal', 'business', 'party', 'sport', 'outdoor', 'beach', 'home'],
    default: ['casual'],
  },
  season: {
    type: [String],
    enum: ['spring', 'summer', 'autumn', 'winter', 'all-season'],
    default: ['all-season'],
  },

  // Auto-generated preview image (first item's image or custom)
  coverImage: { type: String, default: '' },

  // Wear tracking
  wearCount: { type: Number, default: 0 },
  lastWorn: { type: Date },
  wearHistory: [{ type: Date }],

  // Rating (1-5)
  rating: { type: Number, min: 1, max: 5 },

  isFavorite: { type: Boolean, default: false },
  isAIGenerated: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  tags: [{ type: String, lowercase: true }],
}, {
  timestamps: true,
});

outfitSchema.index({ user: 1, occasion: 1 });
outfitSchema.index({ user: 1, season: 1 });
outfitSchema.index({ user: 1, isFavorite: 1 });
outfitSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Outfit', outfitSchema);
