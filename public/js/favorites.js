// Çıkış
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/logout', { method: 'POST' });
  location.href = '/login.html';
});

async function getAppliedStrategyIds() {
  try {
    const res = await fetch('/applied/list', { credentials: 'same-origin' });
    const data = await res.json();
    return Array.isArray(data) ? data.map(d => d.strategy_id) : [];
  } catch {
    return [];
  }
}

async function loadFavorites() {
  const listDiv = document.getElementById('favoritesList');

  try {
    const res = await fetch('/favorites');
    const favs = await res.json();
    const appliedIds = await getAppliedStrategyIds();

    const urlParams = new URLSearchParams(window.location.search);
    const goalReset = urlParams.get('reset') === '1';


    if (!Array.isArray(favs) || favs.length === 0) {
      listDiv.textContent = 'Henüz favori strateji eklemediniz.';
      return;
    }

    // Favori kartlarını oluştur
    listDiv.innerHTML = '';

    favs.forEach(fav => {
      const isApplied = !goalReset && appliedIds.includes(fav.strategy_id); // ✅ güncellendi
      const card = document.createElement('div');
      card.className = `fav-item${isApplied ? ' applied' : ''}`;
      card.id = `fav-${fav.favorite_id}`;

      // Eğer uygulanmışsa arka planı yeşil yap
      if (isApplied) {
        card.style.backgroundColor = '#e6ffe6';
      }

      card.innerHTML = `
        <p><strong>Sektör:</strong> ${fav.sector}</p>
        <p><strong>Hedef Kitle:</strong> ${fav.audience}</p>
        <p><strong>Bütçe:</strong> ${fav.budget}</p>
        <p><strong>Hedef Amacı:</strong> ${fav.marketing_goal}</p>
        <p class="strategy-text"><strong>Strateji:</strong> ${fav.strategy}</p>
        <div class="fav-actions">
          <button class="delete-btn" data-id="${fav.favorite_id}">🗑 Sil</button>
          <button class="pdf-btn" data-id="${fav.favorite_id}">📄 PDF İndir</button>
          <button class="small-btn appliedBtn" data-strategy-id="${fav.strategy_id}">✅ Uyguladım</button>
        </div>
      `;

      // Sil
      card.querySelector('.delete-btn').addEventListener('click', () => {
        deleteFavorite(fav.favorite_id);
      });

      // PDF indir
      card.querySelector('.pdf-btn').addEventListener('click', () => {
        downloadFavoritePDF(fav.favorite_id);
      });

      // Uyguladım
      card.querySelector('.appliedBtn').addEventListener('click', async (e) => {
        const strategyId = e.target.getAttribute('data-strategy-id');

        if (!strategyId) {
          alert('Strateji ID eksik.');
          return;
        }

        try {
          const applyRes = await fetch('/applied', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ strategy_id: strategyId })
          });

          const applyData = await applyRes.json();

          if (applyData.success) {
            alert('Strateji başarıyla uygulandı! ✅');
            card.style.backgroundColor = '#e6ffe6';

            // Hedef ilerlemesini artır
            await fetch('/goals/increment', {
              method: 'POST',
              credentials: 'same-origin'
            });
          } else {
            alert(applyData.error || 'İşlem başarısız.');
          }
        } catch (err) {
          console.error('Uygulama hatası:', err);
          alert('Sunucu hatası oluştu.');
        }
      });

      listDiv.appendChild(card);
    });

  } catch (err) {
    console.error('Favoriler alınamadı:', err);
    listDiv.textContent = 'Favoriler yüklenirken bir hata oluştu.';
  }
}

// Favori sil
async function deleteFavorite(id) {
  if (!confirm('Bu favoriyi silmek istediğinize emin misiniz?')) return;

  const res = await fetch(`/favorites/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (data.success) {
    document.getElementById(`fav-${id}`).remove();
  } else {
    alert('Silme işlemi başarısız.');
  }
}

// PDF indir
async function downloadFavoritePDF(id) {
  const card = document.getElementById(`fav-${id}`);
  await document.fonts.ready;

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `favori_${id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(card).save();
}

document.addEventListener('DOMContentLoaded', loadFavorites);
