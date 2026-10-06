const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', ratingController.getRatings);
router.post('/', authorizeRole('NORMAL_USER'), ratingController.submitRating);
router.put('/:id', authorizeRole('NORMAL_USER'), ratingController.updateRating);

module.exports = router;
