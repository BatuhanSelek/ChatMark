// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'chatmark-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.redirect('/login.html');
  }
});

// KAYIT SAYFASI
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/register.html'));
});

// GİRİŞ SAYFASI
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// KAYIT İŞLEMİ
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tüm alanları doldurun.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.query(sql, [name, email, hash], (err, results) => {
      if (err) {
        console.error('Kayıt hatası:', err);
        return res.status(500).json({ error: 'Kayıt yapılamadı.' });
      }
      req.session.userId = results.insertId;
      res.json({ success: true });
    });
  } catch {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// GİRİŞ İŞLEMİ
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email ve şifre gerekli.' });
  }
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'DB hatası.' });
    if (results.length === 0) {
      return res.status(400).json({ error: 'Kayıt bulunamadı.' });
    }
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Şifre yanlış.' });
    }
    req.session.userId = user.id;
    res.json({ success: true });
  });
});

// ÇIKIŞ
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Strateji endpoint’i (kısaca gösterim)
app.get('/getStrategy', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Önce giriş yapın.' });
  }
  const { sector, audience, budget, marketing_goal } = req.query;
  const sql = `
    SELECT * FROM strategies
     WHERE REPLACE(LOWER(sector), ' ', '')            = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(audience), ' ', '')          = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(budget), ' ', '')            = REPLACE(LOWER(?), ' ', '')
       AND REPLACE(LOWER(marketing_goal), ' ', '')    = REPLACE(LOWER(?), ' ', '')
  `;
  db.query(sql, [sector, audience, budget, marketing_goal], (err, results) => {
    if (err) {
      console.error('DB hatası:', err);
      return res.status(500).json({ error: 'Veritabanı hatası' });
    }
    res.json(results);
  });

  
});

app.post('/favorites', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Önce giriş yapın.' });
  const { strategy_id } = req.body;
  const sql = `INSERT INTO favorites (user_id, strategy_id) VALUES (?,?)`;
  db.query(sql,[req.session.userId,strategy_id],(err,results)=>{
    if(err) return res.status(500).json({ error:'Favori eklenemedi' });
    res.json({ success:true, favoriteId: results.insertId });
  });
});

// 2) Favorileri listele
app.get('/favorites', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Önce giriş yapın.' });
  const sql = `
    SELECT f.id AS favorite_id, s.*
      FROM favorites f
      JOIN strategies s ON f.strategy_id = s.id
     WHERE f.user_id = ?
  `;
  db.query(sql,[req.session.userId],(err,results)=>{
    if(err) return res.status(500).json({ error:'Liste alınamadı' });
    res.json(results);
  });
});

// 3) Favori sil
app.delete('/favorites/:id', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Önce giriş yapın.' });
  const favId = req.params.id;
  const sql = `DELETE FROM favorites WHERE id = ? AND user_id = ?`;
  db.query(sql,[favId, req.session.userId], (err,results)=>{
    if(err) return res.status(500).json({ error:'Favori silinemedi' });
    res.json({ success:true });
  });
});

// 1) Notları getir (strategy_id ile filtreli)
app.get('/notes', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Önce giriş yapın' });
  const strategyId = req.query.strategy_id;
  const sql = `
    SELECT id, content, created_at, updated_at
      FROM notes
     WHERE user_id = ? AND strategy_id = ?
     ORDER BY created_at DESC
  `;
  db.query(sql, [req.session.userId, strategyId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Notlar alınamadı' });
    res.json(rows);
  });
});

// 2) Yeni not ekle
app.post('/notes', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Önce giriş yapın' });
  const { strategy_id, content } = req.body;
  const sql = `INSERT INTO notes (user_id, strategy_id, content) VALUES (?, ?, ?)`;
  db.query(sql, [req.session.userId, strategy_id, content], (err, result) => {
    if (err) return res.status(500).json({ error: 'Not eklenemedi' });
    res.json({ success: true, noteId: result.insertId });
  });
});

// 3) Notu güncelle
app.put('/notes/:id', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Önce giriş yapın' });
  const noteId = req.params.id;
  const { content } = req.body;
  const sql = `
    UPDATE notes
       SET content = ?
     WHERE id = ? AND user_id = ?
  `;
  db.query(sql, [content, noteId, req.session.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Not güncellenemedi' });
    res.json({ success: true });
  });
});

// 4) Notu sil
app.delete('/notes/:id', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Önce giriş yapın' });
  const noteId = req.params.id;
  const sql = `DELETE FROM notes WHERE id = ? AND user_id = ?`;
  db.query(sql, [noteId, req.session.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Not silinemedi' });
    res.json({ success: true });
  });
});




const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});



// AND REPLACE(LOWER(marketing_channel), ' ', '') = REPLACE(LOWER(?), ' ', '')