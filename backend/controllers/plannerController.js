/**
 * Planner Controller
 * Calendar-based outfit planning
 */

const OutfitPlan = require('../models/OutfitPlan');

// ─── GET /api/planner ──────────────────────────────────────────────────────
// Get plans for a date range (e.g. a week)
const getPlans = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user._id };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const plans = await OutfitPlan.find(filter)
      .populate('outfit', 'name coverImage occasion')
      .populate('items', 'name image category color')
      .sort({ date: 1 });

    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/planner ─────────────────────────────────────────────────────
const createPlan = async (req, res, next) => {
  try {
    const { date, outfit, items, occasion, notes, weather } = req.body;

    if (!date) return res.status(400).json({ success: false, message: 'Date is required.' });

    // Upsert: replace if plan already exists for that date
    const plan = await OutfitPlan.findOneAndUpdate(
      { user: req.user._id, date: new Date(date) },
      { outfit, items, occasion, notes, weather },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /api/planner/:id ──────────────────────────────────────────────────
const updatePlan = async (req, res, next) => {
  try {
    const plan = await OutfitPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/planner/:id ───────────────────────────────────────────────
const deletePlan = async (req, res, next) => {
  try {
    const plan = await OutfitPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    res.json({ success: true, message: 'Plan deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/planner/:id/worn ───────────────────────────────────────────
const markWorn = async (req, res, next) => {
  try {
    const plan = await OutfitPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { worn: true },
      { new: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan, markWorn };
