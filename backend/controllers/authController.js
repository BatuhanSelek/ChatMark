// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const db = require('../db');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tüm alanları doldurun.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.query(sql, [name, email, hash], (err, results) => {
      if (err) return res.status(500).json({ error: 'Kayıt yapılamadı.' });
      req.session.userId = results.insertId;
      res.json({ success: true });
    });
  } catch {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre gerekli.' });
  }
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'DB hatası.' });
    if (results.length === 0) return res.status(400).json({ error: 'Kayıt bulunamadı.' });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Şifre yanlış.' });
    req.session.userId = user.id;
    res.json({ success: true });
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
};
