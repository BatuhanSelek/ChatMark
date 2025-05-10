const mysql = require('mysql2/promise'); // ✅ Promise destekli versiyon
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'chatmark', // kendi veritabanı adın
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Bağlantıyı test et
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Veritabanı bağlantısı başarılı');
    connection.release(); // Bağlantıyı serbest bırak
  } catch (err) {
    console.error('Veritabanı bağlantısı hatalı:', err.stack);
  }
})();

module.exports = pool;
