const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRole('SYSTEM_ADMIN'));

router.get('/dashboard', adminController.getAdminDashboard);

module.exports = router;
