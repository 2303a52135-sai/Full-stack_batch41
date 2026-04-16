require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const ClothingItem = require('../models/ClothingItem');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_wardrobe';

const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'activewear'];
const colors = ['black', 'white', 'grey', 'navy', 'blue', 'red', 'green', 'yellow', 'orange', 'pink', 'purple', 'brown', 'beige', 'denim', 'camel', 'olive'];
const brands = ['Zara', 'H&M', 'Uniqlo', 'Nike', 'Adidas', 'Mango', 'Gap', 'Levis', 'Puma', 'ASOS'];
const materials = ['Cotton', 'Linen', 'Wool', 'Polyester', 'Denim', 'Silk', 'Leather'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', '32', '34', '36'];
const occasions = ['casual', 'formal', 'business', 'party', 'sport', 'outdoor', 'home'];
const seasons = ['spring', 'summer', 'autumn', 'winter', 'all-season'];

function pick(arr, idx) {
  return arr[idx % arr.length];
}

function makeItem(index, userId) {
  const category = pick(categories, index);
  const color = pick(colors, index * 2);
  const brand = pick(brands, index * 3);
  const material = pick(materials, index * 4);
  const size = pick(sizes, index * 5);
  const occasion1 = pick(occasions, index);
  const occasion2 = pick(occasions, index + 2);
  const season1 = pick(seasons, index);
  const season2 = pick(seasons, index + 1);

  return {
    user: userId,
    name: `${brand} ${color} ${category.slice(0, 1).toUpperCase()}${category.slice(1)} ${index + 1}`,
    category,
    color,
    brand,
    material,
    size,
    occasion: [occasion1, occasion2].filter((v, i, self) => self.indexOf(v) === i),
    season: [season1, season2].filter((v, i, self) => self.indexOf(v) === i),
    wearCount: Math.floor(Math.random() * 10),
    isFavorite: Math.random() > 0.85,
    isActive: true,
    tags: [category, color, brand.toLowerCase()],
    notes: 'Bulk added sample item',
  };
}

async function run() {
  const emailArg = process.argv[2] ? String(process.argv[2]).toLowerCase() : '';
  const totalToAdd = Number(process.env.WARDROBE_SEED_COUNT || 60);

  await mongoose.connect(MONGO_URI);

  let user;
  if (emailArg) {
    user = await User.findOne({ email: emailArg, isActive: true });
  }

  if (!user) {
    user = await User.findOne({ isActive: true }).sort({ updatedAt: -1, createdAt: -1 });
  }

  if (!user) {
    throw new Error('No active user found. Please register/login once, then run this script again.');
  }

  const items = Array.from({ length: totalToAdd }, (_, i) => makeItem(i, user._id));
  const created = await ClothingItem.insertMany(items);

  const totalItems = await ClothingItem.countDocuments({ user: user._id, isActive: true });
  await User.findByIdAndUpdate(user._id, { 'stats.totalItems': totalItems });

  console.log(`Added ${created.length} items to ${user.email}. Total active items: ${totalItems}`);
  await mongoose.connection.close();
}

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Failed to add wardrobe items:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  });
