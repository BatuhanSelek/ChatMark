// backend/controllers/favoriteController.js
const db = require('../db');

exports.addFavorite = (req, res) => {
  const { strategy_id } = req.body;
  const sql = `INSERT INTO favorites (user_id, strategy_id) VALUES (?, ?)`;
  db.query(sql, [req.session.userId, strategy_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Favori eklenemedi' });
    res.json({ success: true, favoriteId: result.insertId });
  });
};

exports.listFavorites = (req, res) => {
  const sql = `
    SELECT f.id AS favorite_id, s.*
      FROM favorites f
      JOIN strategies s ON f.strategy_id = s.id
     WHERE f.user_id = ?
  `;
  db.query(sql, [req.session.userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Liste alınamadı' });
    res.json(results);
  });
};

exports.deleteFavorite = (req, res) => {
  const favId = req.params.id;
  const sql = `DELETE FROM favorites WHERE id = ? AND user_id = ?`;
  db.query(sql, [favId, req.session.userId], err => {
    if (err) return res.status(500).json({ error: 'Favori silinemedi' });
    res.json({ success: true });
  });
};
