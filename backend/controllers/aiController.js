// backend/controllers/aiController.js
const axios = require('axios');
require('dotenv').config(); // .env dosyasından API key almak için

// Chatbot için strateji açıklaması oluştur
const getStrategyExplanation = async (req, res) => {
  const { strategy } = req.body;

  // Eğer frontend'ten strateji gelmemişse hata dön
  if (!strategy) {
    return res.status(400).json({ error: 'Strateji bilgisi eksik.' });
  }

  try {
    // OpenAI API çağrısı
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // istersen gpt-4o yazabilirsin
        messages: [
          { role: 'system', content: 'Sen bir dijital pazarlama uzmanısın. Kullanıcıya verilen stratejinin nasıl uygulanacağını açıklıyorsun.' },
          { role: 'user', content: `Strateji: "${strategy}". Bu stratejiyi nasıl uygularım?` }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // .env dosyasından çekilecek
        }
      }
    );

    // OpenAI cevabını frontend'e ilet
    const answer = response.data.choices[0].message.content;
    res.json({ reply: answer });

  } catch (error) {
    console.error('OpenAI API hatası:', error.message);
    res.status(500).json({ error: 'AI cevabı alınamadı.' });
  }
};

module.exports = { getStrategyExplanation };
