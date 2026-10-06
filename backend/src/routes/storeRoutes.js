const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', storeController.getStores);
router.post('/', authorizeRole('SYSTEM_ADMIN'), storeController.createStore);
router.get('/:id', storeController.getStoreById);
router.put('/:id', authorizeRole('SYSTEM_ADMIN'), storeController.updateStore);
router.delete('/:id', authorizeRole('SYSTEM_ADMIN'), storeController.deleteStore);

module.exports = router;
