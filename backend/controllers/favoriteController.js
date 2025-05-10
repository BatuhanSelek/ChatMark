// backend/controllers/favoriteController.js
const pool = require('../db');

exports.addFavorite = async (req, res) => {
  const { strategy_id } = req.body;
  if (!strategy_id) {
    return res.status(400).json({ error: 'Strateji ID gerekli.' });
  }

  try {
    const sql = `INSERT INTO favorites (user_id, strategy_id) VALUES (?, ?)`;
    const [result] = await pool.query(sql, [req.session.userId, strategy_id]);
    res.json({ success: true, favoriteId: result.insertId });
  } catch (err) {
    console.error('Favori eklenemedi:', err);
    res.status(500).json({ error: 'Favori eklenemedi' });
  }
};

exports.listFavorites = async (req, res) => {
  try {
    const sql = `
      SELECT 
  f.id AS favorite_id,
  s.id AS strategy_id,
  s.sector, s.audience, s.budget, s.marketing_goal, s.strategy,
  a.strategy_id IS NOT NULL AS is_applied
FROM favorites f
JOIN strategies s ON f.strategy_id = s.id
LEFT JOIN applied_strategies a ON a.strategy_id = s.id AND a.user_id = f.user_id
WHERE f.user_id = ?

    `;
    const [results] = await pool.query(sql, [req.session.userId]);
    res.json(results);
  } catch (err) {
    console.error('Favoriler listelenemedi:', err);
    res.status(500).json({ error: 'Liste alınamadı' });
  }
};

exports.deleteFavorite = async (req, res) => {
  const favId = req.params.id;

  try {
    const sql = `DELETE FROM favorites WHERE id = ? AND user_id = ?`;
    const [result] = await pool.query(sql, [favId, req.session.userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Favori bulunamadı.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Favori silinemedi:', err);
    res.status(500).json({ error: 'Favori silinemedi' });
  }
};
