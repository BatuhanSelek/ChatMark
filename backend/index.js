// backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config(); // .env içeriğini alır

const authRoutes = require('./routes/auth');
const stratRoutes = require('./routes/strategy');
const favRoutes = require('./routes/favorites');
const notesRoutes = require('./routes/notes');
const statisticsRoutes = require('./routes/statistics');
const goalRoutes = require('./routes/goalRoutes');
const appliedRoutes = require('./routes/appliedRoutes');
const aiRoutes = require('./routes/aiRoutes');
const pool = require('./db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'chatmark-secret-key',
    resave: false,
    saveUninitialized: false,
}));



// Frontend sayfaları
app.get('/', (req, res) => {
    if (req.session.userId) {
        // Giriş yapmış kullanıcılar doğrudan index.html'e gider
        return res.sendFile(path.join(__dirname, '../public/index.html'));
    }
    // Giriş yapılmadıysa splash göster
    res.sendFile(path.join(__dirname, '../public/splash.html'));
});


// app.get('/', (req, res) => {
//     if (req.session.userId) return res.sendFile(path.join(__dirname, '../public/index.html'));
//     res.redirect('/login.html');
// });
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, '../public/register.html')));
app.get('/favorites.html', (req, res) => res.sendFile(path.join(__dirname, '../public/favorites.html')));
app.get('/statistics.html', (req, res) => res.sendFile(path.join(__dirname, '../public/statistics.html')));
app.get('/goals.html', (req, res) => res.sendFile(path.join(__dirname, '../public/goals.html')));


// API Route’ları
app.use('/', authRoutes);
app.use('/', authRoutes);
app.use('/', authRoutes);
app.use('/getStrategy', stratRoutes);
app.use('/favorites', favRoutes);
app.use('/notes', notesRoutes);
app.use('/statistics', statisticsRoutes);
app.use('/goals', goalRoutes);
app.use('/api', aiRoutes);
app.use('/', appliedRoutes);

// Statik dosyalar
app.use(express.static(path.join(__dirname, '../public')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
