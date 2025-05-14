document.addEventListener('DOMContentLoaded', async () => {
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const congratsMessage = document.getElementById('congratsMessage');
  const setGoalBtn = document.getElementById('setGoalBtn');
  const targetInput = document.getElementById('targetInput');
  const resetGoalBtn = document.getElementById('resetGoalBtn');

  // 🔁 Manuel sıfırlama
  resetGoalBtn?.addEventListener('click', async () => {
    try {
      const res = await fetch('/goals/reset', {
        method: 'POST',
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('goalReset', 'true'); // ✅ eklendi
        alert('Yeni hedef belirlemek için alan aktif edildi!');
        location.reload();
      } else {
        alert(data.error || 'Sıfırlama başarısız.');
      }
    } catch (err) {
      console.error('Manuel sıfırlama hatası:', err);
    }
  });

  // 🎯 Hedef belirleme
  setGoalBtn?.addEventListener('click', async () => {
    const count = parseInt(targetInput.value);
    if (!count || count < 1) return alert('Geçerli bir hedef sayısı girin.');

    try {
      const res = await fetch('/goals/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ target_count: count })
      });

      const data = await res.json();
      if (data.success) {
        location.reload();
      } else {
        alert(data.error || 'Hedef kaydedilemedi.');
      }
    } catch (err) {
      console.error('Hedef kaydedilemedi:', err);
      alert('Sunucu hatası');
    }
  });

  // 📊 İstatistikleri ve ilerlemeyi yükle
  try {
    const goalRes = await fetch('/goals', { credentials: 'same-origin' });
    const appliedRes = await fetch('/applied', { credentials: 'same-origin' });

    const goalData = await goalRes.json();
    const appliedData = await appliedRes.json();

    if (!goalData || !goalData.total || goalData.total === 0) {
      progressText.textContent = '🎯 Henüz haftalık hedef belirlemediniz.';
      progressBar.style.width = '0%';
      progressBar.textContent = '0%';
      return;
    }

    const applied = appliedData.total || 0;
    const total = goalData.total;
    const percentage = Math.min(Math.round((applied / total) * 100), 100);

    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    progressText.textContent = `🚀 ${applied} / ${total} strateji uygulandı`;

    if (percentage === 100) {
      congratsMessage.style.display = 'block';

      // 3 saniye sonra hedefi sıfırla
      setTimeout(async () => {
        try {
          const res = await fetch('/goals/reset', {
            method: 'POST',
            credentials: 'same-origin'
          });
          const data = await res.json();
          if (data.success) {
            sessionStorage.setItem('goalReset', 'true'); // Gerek kalmadı ama kalabilir
            alert('Yeni hedef belirlemek için giriş aktif edildi!');
            // location.reload(); ❌ bu satır yerine:
            window.location.href = '/favorites.html?reset=1'; // ✅ yönlendirme
          } else {
            console.error('Hedef sıfırlanamadı');
          }
        } catch (err) {
          console.error('Sıfırlama hatası:', err);
        }
      }, 3000);

    }

  } catch (err) {
    console.error('Veri yüklenemedi:', err);
    progressText.textContent = '⚠️ Hedef bilgileri yüklenemedi.';
  }
});
