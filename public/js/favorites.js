// public/favorites.js

// Çıkış
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/logout', { method: 'POST' });
  location.href = '/login.html';
});

async function loadFavorites() {
  const listDiv = document.getElementById('favoritesList');
  try {
    const res = await fetch('/favorites');
    const favs = await res.json();

    if (!Array.isArray(favs) || favs.length === 0) {
      listDiv.textContent = 'Henüz favori strateji eklemediniz.';
      return;
    }

    // Her favori için kart oluştur
    listDiv.innerHTML = favs.map(f => `
      <div class="fav-item" id="fav-${f.favorite_id}">
        <p><strong>Sektör:</strong> ${f.sector}</p>
        <p><strong>Hedef Kitle:</strong> ${f.audience}</p>
        <p><strong>Bütçe:</strong> ${f.budget}</p>
        <p><strong>Hedef Amacı:</strong> ${f.marketing_goal}</p>
        <p class="strategy-text"><strong>Strateji:</strong> ${f.strategy}</p>
        <div class="fav-actions">
          <button class="delete-btn" data-id="${f.favorite_id}">Sil</button>
          <button class="pdf-btn" data-id="${f.favorite_id}">PDF İndir</button>
        </div>
      </div>
    `).join('');

    // Silme ve PDF için event listener ekle
    favs.forEach(f => {
      document.querySelector(`#fav-${f.favorite_id} .delete-btn`)
        .addEventListener('click', () => deleteFavorite(f.favorite_id));
      document.querySelector(`#fav-${f.favorite_id} .pdf-btn`)
        .addEventListener('click', () => downloadFavoritePDF(f.favorite_id));
    });

  } catch (err) {
    console.error(err);
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

// Favori PDF indir
async function downloadFavoritePDF(id) {
  const card = document.getElementById(`fav-${id}`);
  // DOM hazır olana kadar bekleyin (font vb.)
  await document.fonts.ready;

  // html2pdf ayarları
  const opt = {
    margin:       [10,10,10,10],
    filename:     `favori_${id}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(card).save();
}

document.addEventListener('DOMContentLoaded', loadFavorites);
