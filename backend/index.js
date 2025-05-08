// backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const stratRoutes = require('./routes/strategy');
const favRoutes = require('./routes/favorites');
const notesRoutes = require('./routes/notes');
const db = require('./db');

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
    if (req.session.userId) return res.sendFile(path.join(__dirname, '../public/index.html'));
    res.redirect('/login.html');
});
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, '../public/login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, '../public/register.html')));
app.get('/favorites.html', (req, res) => res.sendFile(path.join(__dirname, '../public/favorites.html')));

// API Route’ları
app.use('/', authRoutes);
app.use('/', authRoutes);
app.use('/', authRoutes);
app.use('/getStrategy', stratRoutes);
app.use('/favorites', favRoutes);
app.use('/notes', notesRoutes);

// Statik dosyalar
app.use(express.static(path.join(__dirname, '../public')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
