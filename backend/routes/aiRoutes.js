// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { getStrategyExplanation } = require('../controllers/aiController');

// POST /api/chatbot → strateji metnini alır ve AI'den açıklama döner
router.post('/chatbot', getStrategyExplanation);

module.exports = router;
