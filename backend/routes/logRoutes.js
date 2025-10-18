const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, isAdmin, logController.getLogs);
router.delete('/clear', protect, isAdmin, logController.clearLogs);

module.exports = router;