// chatbot.js
document.addEventListener('DOMContentLoaded', () => {
  const askAIButton = document.getElementById('askAIButton');
  const aiResponseDiv = document.getElementById('aiResponse');

  askAIButton.addEventListener('click', async () => {
    const strategyText = document.getElementById('strategyResult').innerText;

    if (!strategyText) {
      aiResponseDiv.textContent = 'Önce bir strateji belirlemelisiniz.';
      return;
    }

    aiResponseDiv.textContent = 'Yapay zeka düşünüyor...';

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
      } else {
        aiResponseDiv.textContent = 'AI cevabı alınamadı.';
      }
    } catch (err) {
      aiResponseDiv.textContent = 'Bir hata oluştu: ' + err.message;
    }
  });
});
