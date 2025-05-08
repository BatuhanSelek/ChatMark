const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');

// Veritabanı bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'chatmark'
});

fs.createReadStream('veri.csv') // CSV dosyasının adı
  .pipe(csv({ skipHeaders: true }))  // Başlık satırını atla
  .on('data', (row) => {
    // CSV'deki verileri doğru şekilde almak
    const sector = row.isletme_turu; // isletme_turu -> sector
    const strategy = row.strateji;  // strateji -> strategy
    const marketingChannel = row.pazarlama_kanali; // pazarlama_kanali -> marketing_channel
    const marketingGoal = row.pazarlama_hedefi; // pazarlama_hedefi -> marketing_goal
    const audience = row.hedef_kitle; // hedef_kitle -> audience
    const budget = row.butce; // butce -> budget

    // MySQL'e veri ekleme
    const query = `
      INSERT INTO strategies (sector, audience, budget, marketing_channel, strategy, marketing_goal) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [sector, audience, budget, marketingChannel, strategy, marketingGoal], (err, results) => {
      if (err) {
        console.error('Veri eklenemedi:', err);
      } else {
        console.log('Veri başarıyla eklendi:', results);
      }
    });
  })
  .on('end', () => {
    console.log('CSV verisi başarıyla aktarıldı!');
    db.end();  // Veritabanı bağlantısını kapat
  });
