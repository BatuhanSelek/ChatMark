// backend/controllers/goalController.js
const pool = require('../db');

exports.getGoal = async (req, res) => {
  const userId = req.session.userId;
  try {
    const [results] = await pool.query(
      "SELECT * FROM goals WHERE user_id = ?",
      [userId]
    );
    res.json(results[0] || null);
  } catch (err) {
    console.error('Hedef alınamadı:', err);
    res.status(500).json({ error: 'Hedef alınamadı' });
  }
};

exports.setGoal = async (req, res) => {
  const userId = req.session.userId;
  const { target_count } = req.body;

  if (!target_count || target_count < 1) {
    return res.status(400).json({ error: 'Geçerli bir hedef sayısı gerekli' });
  }

  const sql = `
    INSERT INTO goals (user_id, target_count, completed_count)
    VALUES (?, ?, 0)
    ON DUPLICATE KEY UPDATE
    target_count = VALUES(target_count),
    completed_count = 0
  `;

  try {
    await pool.query(sql, [userId, target_count]);
    res.json({ success: true });
  } catch (err) {
    console.error('Hedef kaydedilemedi:', err);
    res.status(500).json({ error: 'Hedef kaydedilemedi' });
  }
};

exports.incrementProgress = async (req, res) => {
  const userId = req.session.userId;
  const sql = `
    UPDATE goals
    SET completed_count = completed_count + 1
    WHERE user_id = ? AND completed_count < target_count
  `;

  try {
    const [result] = await pool.query(sql, [userId]);
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Hedef bulunamadı veya tamamlandı' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('İlerleme güncellenemedi:', err);
    res.status(500).json({ error: 'İlerleme güncellenemedi' });
  }
};
