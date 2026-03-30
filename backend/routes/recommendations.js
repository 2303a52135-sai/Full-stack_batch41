const express = require('express');
const { getRecommendations, getUnusedSuggestions, getTravelRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.get('/', getRecommendations);
router.get('/unused', getUnusedSuggestions);
router.post('/travel', getTravelRecommendations);

module.exports = router;
