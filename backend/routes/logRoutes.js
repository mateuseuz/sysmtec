const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');

router.get('/logs', protect, logController.getLogs);

module.exports = router;
