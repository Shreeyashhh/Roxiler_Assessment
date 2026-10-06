const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', authorizeRole('SYSTEM_ADMIN'), userController.getUsers);
router.post('/', authorizeRole('SYSTEM_ADMIN'), userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.changePassword);

module.exports = router;
