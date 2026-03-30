/**
 * OutfitPlan Model
 * Calendar-based outfit planning entries
 */

const mongoose = require('mongoose');

const outfitPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  outfit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outfit',
  },
  // Allow individual items too (for quick planning)
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
  }],
  occasion: {
    type: String,
    enum: ['casual', 'formal', 'business', 'party', 'sport', 'outdoor', 'beach', 'home'],
  },
  notes: { type: String, maxlength: 300 },
  worn: { type: Boolean, default: false },
  weather: {
    condition: String,
    temperature: Number,
    unit: { type: String, enum: ['C', 'F'], default: 'C' },
  },
}, {
  timestamps: true,
});

// Unique constraint: one outfit plan per user per date
outfitPlanSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('OutfitPlan', outfitPlanSchema);
