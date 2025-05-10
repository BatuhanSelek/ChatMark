// backend/controllers/strategyController.js
const pool = require('../db');

exports.getStrategy = async (req, res) => {
  const { sector, audience, budget, marketing_goal } = req.query;

  const sql = `
    SELECT * FROM strategies
     WHERE REPLACE(LOWER(sector), ' ', '')         = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(audience), ' ', '')       = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(budget), ' ', '')         = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(marketing_goal), ' ', '') = REPLACE(LOWER(?), ' ', '')
  `;

  try {
    const [results] = await pool.query(sql, [sector, audience, budget, marketing_goal]);
    res.json(results);
  } catch (err) {
    console.error('Veritabanı hatası:', err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};
