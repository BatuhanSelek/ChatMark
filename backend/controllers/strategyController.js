// backend/controllers/strategyController.js
const db = require('../db');

exports.getStrategy = (req, res) => {
  const { sector, audience, budget, marketing_goal } = req.query;
  const sql = `
    SELECT * FROM strategies
     WHERE REPLACE(LOWER(sector), ' ', '')         = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(audience), ' ', '')       = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(budget), ' ', '')         = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(marketing_goal), ' ', '') = REPLACE(LOWER(?), ' ', '')
  `;
  db.query(sql, [sector, audience, budget, marketing_goal], (err, results) => {
    if (err) return res.status(500).json({ error: 'Veritabanı hatası' });
    res.json(results);
  });
};
