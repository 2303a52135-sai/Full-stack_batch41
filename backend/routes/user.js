const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

router.use(protect);

// GET /api/users/profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

// PUT /api/users/preferences
router.put('/preferences', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

// GET /api/users (admin only)
router.get('/', adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) { next(error); }
});

module.exports = router;
