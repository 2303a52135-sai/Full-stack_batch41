const express = require('express');
const { getPlans, createPlan, updatePlan, deletePlan, markWorn } = require('../controllers/plannerController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.route('/').get(getPlans).post(createPlan);
router.route('/:id').put(updatePlan).delete(deletePlan);
router.patch('/:id/worn', markWorn);

module.exports = router;
