const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /statistics
router.get('/', authMiddleware, statisticsController.getUserStatistics);

module.exports = router;