const pool = require('../db');

exports.getUserStatistics = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Giriş yapılmamış.' });

  const sql = `
    SELECT 
      s.audience, 
      s.budget, 
      s.marketing_channel, 
      s.marketing_goal 
    FROM favorites f 
    JOIN strategies s ON f.strategy_id = s.id 
    WHERE f.user_id = ?
  `;

  try {
    const [rows] = await pool.query(sql, [userId]);
    console.log('İstatistik verisi:', rows);
    res.json(rows);
  } catch (err) {
    console.error('İstatistik hatası:', err);
    res.status(500).json({ error: 'İstatistik alınamadı' });
  }
};
