const express = require('express');
const {
  getClothingItems, getClothingItem, createClothingItem,
  updateClothingItem, deleteClothingItem, logWear, getStats, toggleFavorite,
} = require('../controllers/clothingController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.use(protect); // All clothing routes are protected

router.get('/stats', getStats);
router.route('/').get(getClothingItems).post(upload.single('image'), createClothingItem);
router.route('/:id').get(getClothingItem).put(upload.single('image'), updateClothingItem).delete(deleteClothingItem);
router.post('/:id/wear', logWear);
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
