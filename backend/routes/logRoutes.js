const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

router.get('/logs', protect, isAdmin, logController.getLogs);

module.exports = router;