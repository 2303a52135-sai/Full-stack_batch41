/**
 * Auth Controller
 * Handles user registration, login, logout, and token refresh
 */

const { validationResult } = require('express-validator');
const User = require('../models/User');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();

  // Don't send password back
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    preferences: user.preferences,
    stats: user.stats,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

// ─── @route   POST /api/auth/register ─────────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Create user
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─── @route   POST /api/auth/login ────────────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    // Find user WITH password (select: false by default)
    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Dev convenience: auto-create demo user on first demo login if not seeded
    const isDemoLogin = normalizedEmail === 'demo@wardrobe.com';
    if (!user && isDemoLogin && process.env.NODE_ENV !== 'production' && password === 'demo1234') {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@wardrobe.com',
        password: 'demo1234',
      });
      user = await User.findById(user._id).select('+password');
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last login
    user.stats.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─── @route   GET /api/auth/me ────────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── @route   PUT /api/auth/updateprofile ─────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'avatar', 'preferences'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── @route   PUT /api/auth/changepassword ────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
