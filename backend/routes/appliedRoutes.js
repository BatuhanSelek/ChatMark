const express = require('express');
const router = express.Router();
const pool = require('../db');
const isAuthenticated = require('../middlewares/authMiddleware');

// GET applied strategies count for current week
router.get('/applied', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;

  try {
    const sql = `
      SELECT COUNT(*) as total 
      FROM applied_strategies 
      WHERE user_id = ? 
      AND applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `;

    const [results] = await pool.query(sql, [userId]);
    res.json({ total: results[0].total || 0 });
  } catch (err) {
    console.error('Uygulanan stratejiler alınamadı:', err);
    res.status(500).json({ error: 'DB hatası' });
  }
});
router.get('/applied/list', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  try {
    const sql = `SELECT strategy_id FROM applied_strategies WHERE user_id = ? AND applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    const [rows] = await pool.query(sql, [userId]);
    res.json(rows);
  } catch (err) {
    console.error('Uygulanan stratejiler alınamadı:', err);
    res.status(500).json({ error: 'DB hatası' });
  }
});

// POST apply strategy
router.post('/applied', isAuthenticated, async (req, res) => {
  const userId = req.session.userId;
  const { strategy_id } = req.body;

  if (!strategy_id) {
    return res.status(400).json({ error: 'Strateji ID gerekli' });
  }

  try {
    // Check if strategy already applied
    const checkSql = `
      SELECT id FROM applied_strategies 
      WHERE user_id = ? AND strategy_id = ?
    `;

    const [existing] = await pool.query(checkSql, [userId, strategy_id]);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Bu strateji zaten uygulanmış' });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert applied strategy
      const insertSql = `
        INSERT INTO applied_strategies (user_id, strategy_id, applied_at) 
        VALUES (?, ?, NOW())
      `;
      await connection.query(insertSql, [userId, strategy_id]);

      // Get current goal
      const goalSql = `
        SELECT id, target_count, completed_count 
        FROM goals 
        WHERE user_id = ? 
        AND applied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY applied_at DESC LIMIT 1
      `;
      const [goals] = await connection.query(goalSql, [userId]);

      // Update goal progress if exists and not completed
      if (goals.length > 0) {
        const goal = goals[0];
        if (goal.completed_count < goal.target_count) {
          const updateSql = `
            UPDATE goals 
            SET completed_count = completed_count + 1 
            WHERE id = ?
          `;
          await connection.query(updateSql, [goal.id]);
        }
      }

      await connection.commit();
      res.json({ success: true });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (err) {
    console.error('Strateji uygulanamadı:', err);
    res.status(500).json({ error: 'DB hatası' });
  }
});

module.exports = router;
