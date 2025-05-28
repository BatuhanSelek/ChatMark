// public/js/chatbot.js

document.addEventListener('DOMContentLoaded', () => {
  // Buton ve div'leri seçiyoruz
  const askAIButton = document.getElementById('askAIButton');              // AI butonu
  const aiResponseDiv = document.getElementById('aiResponse');             // AI cevabının yazılacağı alan
  const saveAIButton = document.getElementById('saveAIResponseBtn');       // Kaydet butonu

  // "Bu stratejiyi nasıl uygularım?" butonuna tıklanınca
  askAIButton.addEventListener('click', async () => {
    const strategyText = document.getElementById('strategyResult').innerText;

    if (!strategyText) {
      aiResponseDiv.textContent = 'Önce bir strateji belirlemelisiniz.';
      return;
    }

    aiResponseDiv.textContent = 'Yapay zeka düşünüyor...';
    saveAIButton.style.display = 'none'; // Eski yanıt varsa butonu gizle

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ strategy: strategyText })
      });

      const data = await res.json();

      if (data.reply) {
        aiResponseDiv.textContent = data.reply;
        saveAIButton.style.display = 'inline-block'; // Cevap gelince buton görünür olsun
      } else {
        aiResponseDiv.textContent = 'AI cevabı alınamadı.';
      }
    } catch (err) {
      aiResponseDiv.textContent = 'Bir hata oluştu: ' + err.message;
    }
  });

  // Yapay zeka cevabını not olarak kaydetme
  saveAIButton.addEventListener('click', async () => {
    const content = aiResponseDiv.textContent.trim();
    const strategyId = document.getElementById('cardContent').getAttribute('data-strategy-id');

    if (!content || !strategyId) {
      alert('Kaydedilecek strateji veya içerik bulunamadı.');
      return;
    }

    try {
      const res = await fetch('/notes', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ strategy_id: strategyId, content })
      });

      const data = await res.json();

      if (data.success) {
        alert('Yapay zeka cevabı başarıyla kaydedildi.');
        await loadNotes(strategyId); // Not listesi güncellensin
      } else {
        alert(data.error || 'Not kaydedilemedi.');
      }
    } catch (err) {
      alert('Not kaydedilirken hata oluştu: ' + err.message);
    }
  });
});
