const express = require('express');
const router = express.Router();
const pool = require('../db');

console.log("📌 calendarRoutes YÜKLENDİ");

router.get('/calendar-events', async (req, res) => {
  console.log("📥 /calendar-events çağrıldı");
  console.log("🔐 Session içeriği:", req.session);

  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Oturum bulunamadı.' });

  const query = `
    SELECT s.strategy AS title, a.applied_at AS start
    FROM applied_strategies a
    JOIN strategies s ON a.strategy_id = s.id
    WHERE a.user_id = ?
  `;

  try {
    const [results] = await pool.query(query, [userId]);
    res.json(results);
  } catch (err) {
    console.error("❌ Veritabanı hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
