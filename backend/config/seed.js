require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const ClothingItem = require('../models/ClothingItem');
const Outfit = require('../models/Outfit');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_wardrobe';

const sampleUser = {
  name: 'Alex Johnson',
  email: 'demo@wardrobe.com',
  password: 'demo1234',
  preferences: {
    favoriteColors: ['black', 'navy', 'white'],
    favoriteStyles: ['casual', 'formal'],
    location: 'New York',
  },
};

const sampleClothing = [
  // ── TOPS (15) ──────────────────────────────────────────────────────────────
  { name: 'White Oxford Shirt',       category: 'tops',        color: 'white',  brand: 'Ralph Lauren',          occasion: ['formal'],          season: ['spring', 'summer'] },
  { name: 'Navy Blue T-Shirt',        category: 'tops',        color: 'navy',   brand: 'Uniqlo',                occasion: ['casual'],          season: ['summer'] },
  { name: 'Black Crewneck Sweater',   category: 'tops',        color: 'black',  brand: 'Zara',                  occasion: ['casual'],          season: ['winter'] },
  { name: 'Striped Linen Shirt',      category: 'tops',        color: 'blue',   brand: 'H&M',                   occasion: ['casual'],          season: ['summer'] },
  { name: 'Grey Hoodie',              category: 'tops',        color: 'grey',   brand: 'Nike',                  occasion: ['sport'],           season: ['autumn'] },
  { name: 'Olive Green Polo',         category: 'tops',        color: 'green',  brand: 'Lacoste',               occasion: ['casual'],          season: ['spring', 'summer'] },
  { name: 'Burgundy Flannel Shirt',   category: 'tops',        color: 'red',    brand: 'Pendleton',             occasion: ['casual'],          season: ['autumn', 'winter'] },
  { name: 'Light Blue Denim Shirt',   category: 'tops',        color: 'blue',   brand: 'Levis',                 occasion: ['casual'],          season: ['spring', 'autumn'] },
  { name: 'White Graphic Tee',        category: 'tops',        color: 'white',  brand: 'Supreme',               occasion: ['casual'],          season: ['summer'] },
  { name: 'Black Turtleneck',         category: 'tops',        color: 'black',  brand: 'COS',                   occasion: ['casual', 'formal'],season: ['winter'] },
  { name: 'Yellow Oversized Tee',     category: 'tops',        color: 'yellow', brand: 'H&M',                   occasion: ['casual'],          season: ['summer'] },
  { name: 'Pink Oxford Button-Down',  category: 'tops',        color: 'pink',   brand: 'Brooks Brothers',       occasion: ['formal'],          season: ['spring'] },
  { name: 'Camel Cardigan',           category: 'tops',        color: 'beige',  brand: 'Uniqlo',                occasion: ['casual'],          season: ['autumn', 'winter'] },
  { name: 'Rust Knit Sweater',        category: 'tops',        color: 'orange', brand: 'Mango',                 occasion: ['casual'],          season: ['winter'] },
  { name: 'White Linen Shirt',        category: 'tops',        color: 'white',  brand: 'Zara',                  occasion: ['casual'],          season: ['summer'] },

  // ── BOTTOMS (10) ───────────────────────────────────────────────────────────
  { name: 'Dark Wash Slim Jeans',     category: 'bottoms',     color: 'denim',  brand: "Levi's",                occasion: ['casual'],          season: ['all-season'] },
  { name: 'Charcoal Dress Trousers',  category: 'bottoms',     color: 'grey',   brand: 'Massimo Dutti',         occasion: ['formal'],          season: ['all-season'] },
  { name: 'Beige Chinos',             category: 'bottoms',     color: 'beige',  brand: 'Gap',                   occasion: ['casual'],          season: ['spring', 'summer'] },
  { name: 'Black Joggers',            category: 'bottoms',     color: 'black',  brand: 'Adidas',                occasion: ['sport'],           season: ['all-season'] },
  { name: 'Olive Cargo Pants',        category: 'bottoms',     color: 'green',  brand: 'Dickies',               occasion: ['casual'],          season: ['autumn'] },
  { name: 'Light Wash Wide Jeans',    category: 'bottoms',     color: 'denim',  brand: 'Levis',                 occasion: ['casual'],          season: ['spring', 'summer'] },
  { name: 'Navy Dress Pants',         category: 'bottoms',     color: 'navy',   brand: 'Hugo Boss',             occasion: ['formal'],          season: ['all-season'] },
  { name: 'Grey Sweatpants',          category: 'bottoms',     color: 'grey',   brand: 'Champion',              occasion: ['sport'],           season: ['autumn', 'winter'] },
  { name: 'Black Slim Chinos',        category: 'bottoms',     color: 'black',  brand: 'Zara',                  occasion: ['casual', 'formal'],season: ['all-season'] },
  { name: 'Khaki Shorts',             category: 'bottoms',     color: 'beige',  brand: 'Polo Ralph Lauren',     occasion: ['casual'],          season: ['summer'] },

  // ── DRESSES (3) ────────────────────────────────────────────────────────────
  { name: 'Black Wrap Dress',         category: 'dresses',     color: 'black',  brand: 'Diane von Furstenberg', occasion: ['formal', 'party'], season: ['spring', 'summer'] },
  { name: 'Floral Midi Dress',        category: 'dresses',     color: 'pink',   brand: 'Zara',                  occasion: ['casual'],          season: ['spring', 'summer'] },
  { name: 'Navy Cocktail Dress',      category: 'dresses',     color: 'navy',   brand: 'BCBG',                  occasion: ['party', 'formal'], season: ['all-season'] },

  // ── SHOES (8) ──────────────────────────────────────────────────────────────
  { name: 'White Leather Sneakers',   category: 'shoes',       color: 'white',  brand: 'Adidas',                occasion: ['casual'],          season: ['spring', 'summer'] },
  { name: 'Black Oxford Shoes',       category: 'shoes',       color: 'black',  brand: 'Clarks',                occasion: ['formal'],          season: ['all-season'] },
  { name: 'Brown Chelsea Boots',      category: 'shoes',       color: 'brown',  brand: 'Thursday',              occasion: ['casual'],          season: ['autumn', 'winter'] },
  { name: 'Grey Running Shoes',       category: 'shoes',       color: 'grey',   brand: 'Nike',                  occasion: ['sport'],           season: ['all-season'] },
  { name: 'Tan Loafers',              category: 'shoes',       color: 'beige',  brand: 'Cole Haan',             occasion: ['casual', 'formal'],season: ['spring', 'summer'] },
  { name: 'Black Ankle Boots',        category: 'shoes',       color: 'black',  brand: 'Steve Madden',          occasion: ['casual'],          season: ['autumn', 'winter'] },
  { name: 'White High-Top Sneakers',  category: 'shoes',       color: 'white',  brand: 'Converse',              occasion: ['casual'],          season: ['spring', 'summer'] },
  { name: 'Suede Desert Boots',       category: 'shoes',       color: 'beige',  brand: 'Clarks',                occasion: ['casual'],          season: ['autumn'] },

  // ── OUTERWEAR (6) ──────────────────────────────────────────────────────────
  { name: 'Navy Peacoat',             category: 'outerwear',   color: 'navy',   brand: 'J.Crew',                occasion: ['casual'],          season: ['winter'] },
  { name: 'Khaki Trench Coat',        category: 'outerwear',   color: 'beige',  brand: 'Burberry',              occasion: ['formal'],          season: ['autumn'] },
  { name: 'Black Puffer Jacket',      category: 'outerwear',   color: 'black',  brand: 'The North Face',        occasion: ['casual'],          season: ['winter'] },
  { name: 'Olive Field Jacket',       category: 'outerwear',   color: 'green',  brand: 'Barbour',               occasion: ['casual'],          season: ['autumn'] },
  { name: 'Grey Wool Overcoat',       category: 'outerwear',   color: 'grey',   brand: 'COS',                   occasion: ['formal'],          season: ['winter'] },
  { name: 'Denim Jacket',             category: 'outerwear',   color: 'denim',  brand: "Levi's",                occasion: ['casual'],          season: ['spring', 'autumn'] },

  // ── ACCESSORIES (8) ────────────────────────────────────────────────────────
  { name: 'Navy Wool Scarf',          category: 'accessories', color: 'navy',   brand: 'Acne Studios',          occasion: ['casual'],          season: ['winter'] },
  { name: 'Leather Belt Black',       category: 'accessories', color: 'black',  brand: 'Coach',                 occasion: ['formal'],          season: ['all-season'] },
  { name: 'Minimalist Watch',         category: 'accessories', color: 'silver', brand: 'Daniel Wellington',     occasion: ['casual'],          season: ['all-season'] },
  { name: 'Brown Leather Wallet',     category: 'accessories', color: 'brown',  brand: 'Fossil',                occasion: ['casual'],          season: ['all-season'] },
  { name: 'Black Beanie',             category: 'accessories', color: 'black',  brand: 'Carhartt',              occasion: ['casual'],          season: ['winter'] },
  { name: 'Tortoise Sunglasses',      category: 'accessories', color: 'brown',  brand: 'Ray-Ban',               occasion: ['casual'],          season: ['summer'] },
  { name: 'Canvas Tote Bag',          category: 'accessories', color: 'beige',  brand: 'Baggu',                 occasion: ['casual'],          season: ['all-season'] },
  { name: 'Gold Chain Necklace',      category: 'accessories', color: 'gold',   brand: 'Mejuri',                occasion: ['casual', 'party'], season: ['all-season'] },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Drop stale indexes to prevent parallel array index errors
    const db = mongoose.connection.db;
    const collections = ['users', 'clothingitems', 'outfits'];
    for (const col of collections) {
      const exists = await db.listCollections({ name: col }).hasNext();
      if (exists) {
        await db.collection(col).dropIndexes();
        console.log(`🗂️  Dropped indexes on: ${col}`);
      }
    }

    await User.deleteMany({});
    await ClothingItem.deleteMany({});
    await Outfit.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const user = await User.create(sampleUser);
    console.log(`👤 Created user: ${user.email}`);

    const clothingWithUser = sampleClothing.map(item => ({
      ...item,
      user: user._id,
      wearCount: Math.floor(Math.random() * 15),
      isFavorite: Math.random() > 0.8,
    }));

    const createdItems = [];
    for (const item of clothingWithUser) {
      const created = await ClothingItem.create(item);
      createdItems.push(created);
    }
    console.log(`👕 Created ${createdItems.length} clothing items`);

    const tops    = createdItems.filter(i => i.category === 'tops');
    const bottoms = createdItems.filter(i => i.category === 'bottoms');
    const shoes   = createdItems.filter(i => i.category === 'shoes');
    const outer   = createdItems.filter(i => i.category === 'outerwear');
    const acc     = createdItems.filter(i => i.category === 'accessories');

    await Outfit.create({
      user: user._id,
      name: 'Business Classic',
      items: [
        { item: tops[0]._id,    position: 'top' },
        { item: bottoms[1]._id, position: 'bottom' },
        { item: shoes[1]._id,   position: 'shoes' },
        { item: acc[1]._id,     position: 'accessory' },
      ],
      occasion: ['formal'],
      season: ['all-season'],
      wearCount: 8,
    });

    await Outfit.create({
      user: user._id,
      name: 'Weekend Casual',
      items: [
        { item: tops[1]._id,    position: 'top' },
        { item: bottoms[0]._id, position: 'bottom' },
        { item: shoes[0]._id,   position: 'shoes' },
        { item: acc[2]._id,     position: 'accessory' },
      ],
      occasion: ['casual'],
      season: ['spring'],
      wearCount: 12,
    });

    await Outfit.create({
      user: user._id,
      name: 'Winter Layer',
      items: [
        { item: tops[9]._id,    position: 'top' },
        { item: bottoms[2]._id, position: 'bottom' },
        { item: shoes[2]._id,   position: 'shoes' },
        { item: outer[0]._id,   position: 'outerwear' },
        { item: acc[0]._id,     position: 'accessory' },
      ],
      occasion: ['casual'],
      season: ['winter'],
      wearCount: 5,
    });

    await Outfit.create({
      user: user._id,
      name: 'Smart Sport',
      items: [
        { item: tops[4]._id,    position: 'top' },
        { item: bottoms[3]._id, position: 'bottom' },
        { item: shoes[3]._id,   position: 'shoes' },
      ],
      occasion: ['sport'],
      season: ['autumn'],
      wearCount: 9,
    });

    await User.findByIdAndUpdate(user._id, {
      'stats.totalItems': createdItems.length,
      'stats.totalOutfits': 4,
    });

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────────────');
    console.log(`📧 Login Email : ${sampleUser.email}`);
    console.log(`🔑 Password    : ${sampleUser.password}`);
    console.log(`👕 Clothes     : ${createdItems.length}`);
    console.log(`👗 Outfits     : 4`);
    console.log('─────────────────────────────────\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();