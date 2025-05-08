// backend/routes/strategy.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getStrategy } = require('../controllers/strategyController');

router.get('/', auth, getStrategy);

module.exports = router;
