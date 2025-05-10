// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const pool = require('../db');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tüm alanları doldurun.' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    const [result] = await pool.query(sql, [name, email, hash]);
    req.session.userId = result.insertId;
    res.json({ success: true });
  } catch (err) {
    console.error('Kayıt hatası:', err);
    res.status(500).json({ error: 'Kayıt yapılamadı.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre gerekli.' });
  }

  try {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await pool.query(sql, [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Kayıt bulunamadı.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Şifre yanlış.' });
    }

    req.session.userId = user.id;
    res.json({ success: true });
  } catch (err) {
    console.error('Giriş hatası:', err);
    res.status(500).json({ error: 'DB hatası.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
};
