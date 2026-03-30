// outfits route
const express = require('express');
const { getOutfits, getOutfit, createOutfit, updateOutfit, deleteOutfit, logOutfitWear, toggleFavorite } = require('../controllers/outfitController');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);
router.route('/').get(getOutfits).post(createOutfit);
router.route('/:id').get(getOutfit).put(updateOutfit).delete(deleteOutfit);
router.post('/:id/wear', logOutfitWear);
router.patch('/:id/favorite', toggleFavorite);
module.exports = router;
