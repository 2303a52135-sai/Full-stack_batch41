const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tops','bottoms','dresses','outerwear','shoes','accessories','activewear','underwear','sleepwear'],
  },
  subcategory: { type: String, trim: true },
  color: { type: String, required: true, trim: true, lowercase: true },
  colors: [{ type: String }],
  brand: { type: String, trim: true, default: 'Unknown' },
  occasion: [{ type: String }],
  season: [{ type: String }],
  material: { type: String },
  size: { type: String },
  purchaseDate: { type: Date },
  purchasePrice: { type: Number },
  notes: { type: String },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  wearCount: { type: Number, default: 0 },
  lastWorn: { type: Date },
  wearHistory: [{ type: Date }],
  isFavorite: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
}, {
  timestamps: true,
});
clothingItemSchema.index({ user: 1, category: 1 });   // category is a string ✅
clothingItemSchema.index({ user: 1, season: 1 });      // season alone is fine ✅
clothingItemSchema.index({ user: 1, occasion: 1 });    // occasion alone is fine ✅
clothingItemSchema.index({ user: 1, isFavorite: 1 });
clothingItemSchema.index({ user: 1, isActive: 1 });
clothingItemSchema.index({ tags: 1 });

module.exports = mongoose.model('ClothingItem', clothingItemSchema);