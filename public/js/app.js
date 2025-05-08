// public/app.js

// Çıkış butonu
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.href = '/login.html';
  } catch {
    alert('Çıkış yapılırken hata oluştu.');
  }
});

// Notları yükleyen fonksiyon
async function loadNotes(strategyId) {
  const listEl = document.getElementById('notesList');
  listEl.innerHTML = 'Yükleniyor...';

  try {
    const res = await fetch(`/notes?strategy_id=${strategyId}`, { credentials: 'same-origin' });
    const notes = await res.json();

    if (!Array.isArray(notes) || notes.length === 0) {
      listEl.innerHTML = '<li>Henüz not eklemediniz.</li>';
      return;
    }

    listEl.innerHTML = notes
      .map(note => `
        <li id="note-${note.id}" class="note-item">
          <div class="note-text">${note.content}</div>
          <div class="note-meta">
            <small>${new Date(note.created_at).toLocaleString()}</small>
            <button class="edit-note" data-id="${note.id}">Düzenle</button>
            <button class="delete-note" data-id="${note.id}">Sil</button>
          </div>
        </li>
      `).join('');

    // Sil ve Düzenle eventleri
    notes.forEach(note => {
      document.querySelector(`#note-${note.id} .delete-note`).addEventListener('click', async () => {
        if (!confirm('Notu silmek istediğinize emin misiniz?')) return;
        await fetch(`/notes/${note.id}`, {
          method: 'DELETE',
          credentials: 'same-origin'
        });
        document.getElementById(`note-${note.id}`).remove();
      });

      document.querySelector(`#note-${note.id} .edit-note`).addEventListener('click', async () => {
        const newContent = prompt('Notu düzenleyin:', note.content);
        if (newContent == null) return;
        await fetch(`/notes/${note.id}`, {
          method: 'PUT',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent })
        });
        document.querySelector(`#note-${note.id} .note-text`).textContent = newContent;
      });
    });

  } catch {
    listEl.innerHTML = '<li>Notlar yüklenirken hata oluştu.</li>';
  }
}

// Strateji formu submit
document.getElementById('strategyForm').addEventListener('submit', async e => {
  e.preventDefault();

  const sector = document.getElementById('sector').value;
  const audience = document.getElementById('audience').value;
  const budget = document.getElementById('budget').value;
  const marketing_goal = document.getElementById('marketing_goal').value;
  const resultEl = document.getElementById('strategyResult');

  resultEl.textContent = 'Yükleniyor...';

  try {
    const url = `/getStrategy?`
      + `sector=${encodeURIComponent(sector)}`
      + `&audience=${encodeURIComponent(audience)}`
      + `&budget=${encodeURIComponent(budget)}`
      + `&marketing_goal=${encodeURIComponent(marketing_goal)}`;

    const res = await fetch(url, { credentials: 'same-origin' });
    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error('Beklenmeyen API cevabı');
    }
    if (data.length === 0) {
      resultEl.textContent = 'Strateji bulunamadı.';
      return;
    }

    const strat = data[0];

    // Kart + Notlar UI
    resultEl.innerHTML = `
      <div class="card" id="cardContent" data-strategy-id="${strat.id}">
        <h3>Önerilen Strateji:</h3>
        <p class="strategy-text">${strat.strategy}</p>
        <div class="card-actions">
          <button id="favBtn" class="small-btn">❤ Favorilere Ekle</button>
        </div>
      </div>

      <div id="notesSection" style="margin-top:20px;">
        <h4>Notlar</h4>
        <ul id="notesList"></ul>
        <textarea id="noteContent" rows="3" placeholder="Notunuzu yazın..."></textarea>
        <button id="saveNoteBtn" class="small-btn">Notu Kaydet</button>
      </div>
    `;

    // Favori ekleme
    document.getElementById('favBtn').addEventListener('click', async () => {
      try {
        const favRes = await fetch('/favorites', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strategy_id: strat.id })
        });
        const favData = await favRes.json();
        alert(favData.success ? 'Favorilere eklendi!' : (favData.error || 'Favori eklenemedi.'));
      } catch {
        alert('Favori ekleme hatası.');
      }
    });

    // Notları yükle
    await loadNotes(strat.id);

    // Not kaydetme
    document.getElementById('saveNoteBtn').addEventListener('click', async () => {
      const content = document.getElementById('noteContent').value.trim();
      if (!content) {
        alert('Lütfen bir not girin.');
        return;
      }
      const saveRes = await fetch('/notes', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy_id: strat.id, content })
      });
      const saveData = await saveRes.json();
      if (saveData.success) {
        document.getElementById('noteContent').value = '';
        await loadNotes(strat.id);
      } else {
        alert(saveData.error || 'Not kaydedilirken hata oluştu.');
      }
    });

  } catch (err) {
    console.error('Fetch hatası:', err);
    resultEl.textContent = 'Strateji yüklenirken hata oluştu.';
  }
});
