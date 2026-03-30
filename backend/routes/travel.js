const express = require('express');
const { getTravelRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.post('/', getTravelRecommendations);

module.exports = router;
