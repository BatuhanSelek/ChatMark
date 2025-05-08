const mysql = require('mysql2');

// Veritabanı bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Veritabanı kullanıcı adı
  password: '1234',  // Veritabanı şifresi
  database: 'chatmark'  // Veritabanı adı
});

db.connect((err) => {
  if (err) {
    console.error('Veritabanı bağlantısı hatalı:', err.stack);
    return;
  }
  console.log('Veritabanı bağlantısı başarılı');
});

module.exports = db;
