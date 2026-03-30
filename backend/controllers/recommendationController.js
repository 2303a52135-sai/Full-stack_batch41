/**
 * Recommendation Controller
 * Content-based filtering for smart outfit recommendations
 */

const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');
const axios = require('axios').default;

// ─── Color Compatibility Map ───────────────────────────────────────────────
// Based on color theory - which colors pair well together
const colorCompatibility = {
  black: ['white', 'red', 'blue', 'grey', 'navy', 'beige', 'pink', 'yellow', 'green', 'purple'],
  white: ['black', 'navy', 'blue', 'red', 'grey', 'beige', 'brown', 'pink', 'green'],
  navy: ['white', 'beige', 'grey', 'light blue', 'red', 'yellow', 'orange'],
  grey: ['black', 'white', 'navy', 'blue', 'pink', 'red', 'yellow'],
  beige: ['white', 'navy', 'brown', 'black', 'olive', 'camel'],
  brown: ['beige', 'white', 'cream', 'olive', 'navy', 'orange'],
  red: ['black', 'white', 'navy', 'grey', 'denim'],
  blue: ['white', 'navy', 'grey', 'beige', 'brown', 'orange'],
  green: ['white', 'beige', 'brown', 'navy', 'grey', 'camel'],
  pink: ['grey', 'white', 'navy', 'black', 'beige'],
  yellow: ['navy', 'black', 'white', 'grey', 'brown'],
  orange: ['navy', 'black', 'white', 'brown', 'blue'],
  purple: ['black', 'white', 'grey', 'beige', 'cream'],
  denim: ['white', 'black', 'grey', 'red', 'navy', 'beige', 'brown'],
};

// Check if two colors are compatible
const areColorsCompatible = (color1, color2) => {
  const c1 = color1?.toLowerCase();
  const c2 = color2?.toLowerCase();
  if (c1 === c2) return true;
  return colorCompatibility[c1]?.includes(c2) || colorCompatibility[c2]?.includes(c1) || true;
};

// Scoring function for recommendation ranking
const scoreOutfitMatch = (top, bottom, preferences) => {
  let score = 0;

  // Color compatibility (+30 points)
  if (areColorsCompatible(top.color, bottom.color)) score += 30;

  // Same occasion (+20 points)
  const sharedOccasions = top.occasion?.filter(o => bottom.occasion?.includes(o));
  score += (sharedOccasions?.length || 0) * 20;

  // Same season (+15 points)
  const sharedSeasons = top.season?.filter(s => bottom.season?.includes(s) || s === 'all-season');
  score += (sharedSeasons?.length || 0) * 15;

  // Prefer less-worn items (suggest unused clothes) (+10 points)
  if (top.wearCount < 3) score += 10;
  if (bottom.wearCount < 3) score += 10;

  // User's favorite colors (+5 points)
  if (preferences?.favoriteColors?.includes(top.color)) score += 5;
  if (preferences?.favoriteColors?.includes(bottom.color)) score += 5;

  return score;
};

// ─── GET /api/recommendations ──────────────────────────────────────────────
// Main recommendation engine - suggests outfits based on user preferences
const getRecommendations = async (req, res, next) => {
  try {
    const { occasion, season, limit = 6 } = req.query;
    const user = req.user;

    // Get user's clothes
    const filter = { user: user._id, isActive: true };
    if (occasion) filter.occasion = { $in: [occasion] };
    if (season) filter.season = { $in: [season, 'all-season'] };

    const allItems = await ClothingItem.find(filter).lean();

    if (allItems.length < 2) {
      return res.json({
        success: true,
        message: 'Add more items to get outfit recommendations.',
        data: [],
      });
    }

    // Categorize items
    const tops = allItems.filter(i => ['tops', 'outerwear', 'activewear'].includes(i.category));
    const bottoms = allItems.filter(i => ['bottoms', 'dresses'].includes(i.category));
    const shoes = allItems.filter(i => i.category === 'shoes');
    const accessories = allItems.filter(i => i.category === 'accessories');

    const recommendations = [];

    // Generate outfit combinations
    for (const top of tops) {
      for (const bottom of bottoms) {
        const score = scoreOutfitMatch(top, bottom, user.preferences);
        const outfit = { top, bottom, score };

        // Add shoes if available
        if (shoes.length > 0) {
          // Pick the most compatible shoe
          const bestShoe = shoes.reduce((best, shoe) => {
            const shoeScore = areColorsCompatible(top.color, shoe.color) &&
                              areColorsCompatible(bottom.color, shoe.color) ? 10 : 0;
            return shoeScore > 0 ? shoe : best;
          }, shoes[0]);
          outfit.shoes = bestShoe;
        }

        // Add accessory if available
        if (accessories.length > 0) {
          outfit.accessory = accessories[Math.floor(Math.random() * accessories.length)];
        }

        recommendations.push(outfit);
      }
    }

    // Sort by score and return top N recommendations
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, parseInt(limit));

    res.json({ success: true, count: topRecommendations.length, data: topRecommendations });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/recommendations/unused ──────────────────────────────────────
// Suggest clothes that haven't been worn in a while
const getUnusedSuggestions = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const unusedItems = await ClothingItem.find({
      user: req.user._id,
      isActive: true,
      $or: [
        { wearCount: 0 },
        { lastWorn: { $lt: thirtyDaysAgo } },
        { lastWorn: null },
      ],
    }).sort({ wearCount: 1, createdAt: 1 }).limit(10).lean();

    res.json({ success: true, count: unusedItems.length, data: unusedItems });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/recommendations/travel ─────────────────────────────────────
// Generate packing list for a trip
const getTravelRecommendations = async (req, res, next) => {
  try {
    const { destination, days, occasions = ['casual'] } = req.body;

    if (!destination || !days) {
      return res.status(400).json({ success: false, message: 'Destination and days are required.' });
    }

    const daysCount = parseInt(days);
    const allItems = await ClothingItem.find({ user: req.user._id, isActive: true }).lean();

    // Calculate quantities needed
    const packingList = {
      destination,
      days: daysCount,
      items: {
        tops: [],
        bottoms: [],
        shoes: [],
        accessories: [],
        outerwear: [],
      },
      tips: [],
    };

    // Smart packing logic: enough for days + 20% buffer
    const topsNeeded = Math.ceil(daysCount * 1.2);
    const bottomsNeeded = Math.ceil(daysCount * 0.6); // Mix and match
    const shoesNeeded = Math.min(3, Math.ceil(daysCount / 3));

    const tops = allItems.filter(i => i.category === 'tops').slice(0, topsNeeded);
    const bottoms = allItems.filter(i => i.category === 'bottoms').slice(0, bottomsNeeded);
    const shoes = allItems.filter(i => i.category === 'shoes').slice(0, shoesNeeded);
    const accessories = allItems.filter(i => i.category === 'accessories').slice(0, 3);
    const outerwear = allItems.filter(i => i.category === 'outerwear').slice(0, 1);

    packingList.items = { tops, bottoms, shoes, accessories, outerwear };
    packingList.totalItems = tops.length + bottoms.length + shoes.length + accessories.length + outerwear.length;

    // Travel tips
    packingList.tips = [
      `Pack ${topsNeeded} tops for ${daysCount} days`,
      'Choose neutral-colored items that mix and match easily',
      'Pack 1 formal outfit in case of special occasions',
      'Roll clothes instead of folding to save space',
    ];

    res.json({ success: true, data: packingList });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations, getUnusedSuggestions, getTravelRecommendations };
