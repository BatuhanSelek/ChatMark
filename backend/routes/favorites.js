// backend/routes/favorites.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  addFavorite,
  listFavorites,
  deleteFavorite
} = require('../controllers/favoriteController');

router.post('/', auth, addFavorite);
router.get('/', auth, listFavorites);
router.delete('/:id', auth, deleteFavorite);

module.exports = router;
