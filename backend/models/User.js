/**
 * User Model
 * Handles user authentication and profile data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password in queries by default
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  // User preferences for smart recommendations
  preferences: {
    favoriteColors: [{ type: String }],
    favoriteStyles: [{ type: String, enum: ['casual', 'formal', 'sporty', 'bohemian', 'streetwear', 'classic'] }],
    bodyType: { type: String, enum: ['slim', 'athletic', 'curvy', 'plus', 'petite', ''] },
    location: { type: String, default: '' }, // for weather-based recommendations
    preferredSeasons: [{ type: String, enum: ['spring', 'summer', 'autumn', 'winter'] }],
  },

  // Stats
  stats: {
    totalItems: { type: Number, default: 0 },
    totalOutfits: { type: Number, default: 0 },
    lastLogin: { type: Date },
  },

  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

// ─── Middleware: Hash password before saving ──────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Method: Compare entered password with hashed ────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Method: Generate JWT token ───────────────────────────────────────────
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// ─── Index for performance ────────────────────────────────────────────────

module.exports = mongoose.model('User', userSchema);
