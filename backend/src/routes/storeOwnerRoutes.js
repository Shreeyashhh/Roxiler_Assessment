const express = require('express');
const router = express.Router();
const storeOwnerController = require('../controllers/storeOwnerController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRole('STORE_OWNER'));

router.get('/dashboard', storeOwnerController.getStoreOwnerDashboard);

module.exports = router;
