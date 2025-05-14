const express = require('express');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require('../middlewares/authMiddleware');

// GET current goal
router.get('/', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;

  try {
    const sql = `
      SELECT target_count, completed_count 
      FROM goals 
      WHERE user_id = ? 
      ORDER BY applied_at DESC 
      LIMIT 1
    `;
    const [goals] = await pool.query(sql, [userId]);

    if (!goals || goals.length === 0) {
      return res.json({ total: 0, completed: 0 });
    }

    const { target_count, completed_count } = goals[0];
    return res.json({ total: target_count, completed: completed_count });

  } catch (err) {
    console.error('Hedef bilgileri alınamadı:', err);
    res.status(500).json({ error: 'DB hatası' });
  }
});

// POST set/update goal
router.post('/set', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { target_count } = req.body;

  if (!target_count || target_count < 1) {
    return res.status(400).json({ error: 'Geçerli bir hedef sayısı gerekli' });
  }

  try {
    const sql = `
      INSERT INTO goals (user_id, target_count, completed_count, applied_at)
      VALUES (?, ?, 0, NOW())
    `;
    await pool.query(sql, [userId, target_count]);
    res.json({ success: true });

  } catch (err) {
    console.error('Hedef kaydedilemedi:', err);
    res.status(500).json({ error: 'DB hatası' });
  }
});

// POST increment progress
router.post('/increment', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;

  try {
    // Get the latest goal
    const [rows] = await pool.query(`
      SELECT id, target_count, completed_count 
      FROM goals 
      WHERE user_id = ? 
      ORDER BY applied_at DESC 
      LIMIT 1
    `, [userId]);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'Hedef bulunamadı' });
    }

    const goal = rows[0];

    // Eğer hedef zaten tamamlandıysa bir şey yapma
    if (goal.completed_count >= goal.target_count) {
      return res.status(400).json({ error: 'Hedef zaten tamamlandı' });
    }

    const newCount = goal.completed_count + 1;

    // Güncelle
    await pool.query(`
      UPDATE goals 
      SET completed_count = ? 
      WHERE id = ?
    `, [newCount, goal.id]);

    res.json({ success: true });

  } catch (err) {
    console.error('İlerleme artırılamadı:', err);
    res.status(500).json({ error: 'DB hatası' });
  }
});
// ✅ Hedefi sıfırla
// ✅ Hedefi sıfırla + uygulanan stratejileri temizle
router.post('/reset', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    // 1. Son 7 gün içerisindeki hedefleri sil
    await pool.query(`
      DELETE FROM goals 
      WHERE user_id = ? 
      AND applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `, [userId]);

    // 2. Aynı şekilde son 7 gün içindeki uygulanan stratejileri de sil
    await pool.query(`
      DELETE FROM applied_strategies 
      WHERE user_id = ? 
      AND applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `, [userId]);

    res.json({ success: true });
  } catch (err) {
    console.error('Hedef sıfırlama hatası:', err);
    res.status(500).json({ error: 'Hedef sıfırlanamadı' });
  }
});



module.exports = router;
