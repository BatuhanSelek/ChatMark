// Çıkış butonu
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
  location.href = '/login.html';
});

const listEl = document.getElementById('allNotesList');

// 1) Tüm notları çek ve listele
async function loadAllNotes() {
  listEl.innerHTML = 'Yükleniyor...';
  try {
    const res = await fetch('/notes/all', { credentials: 'same-origin' });
    const notes = await res.json();

    if (!notes.length) {
      listEl.innerHTML = '<li>Henüz bir not yok.</li>';
      return;
    }

    listEl.innerHTML = notes.map(n => {
      const listItems = n.content
        .split(/\n|-\s+/) // yeni satır veya "- " ile ayır
        .filter(item => item.trim() !== '')
        .map(item => `<li>${item.trim()}</li>`)
        .join('');

      return `
        <li id="note-${n.id}" class="note-item" style="background: #f8fafc; border-left: 5px solid #0ea5e9; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <p style="font-weight: bold; color: #1e293b;"><strong>Strateji:</strong> ${n.strategy_text}</p>
          <ul style="list-style-type: disc; padding-left: 1.2rem; color: #334155; font-weight: 500; line-height: 1.6;">
            ${listItems}
          </ul>
          <small style="color: #64748b;">${new Date(n.created_at).toLocaleString()}</small>
          <div class="note-meta" style="margin-top: 0.5rem;">
            <button class="edit-note" data-id="${n.id}">Düzenle</button>
            <button class="delete-note" data-id="${n.id}">Sil</button>
          </div>
        </li>
      `;
    }).join('');

    // Sil & Düzenle event'leri
    notes.forEach(n => {
      document.querySelector(`#note-${n.id} .delete-note`)
        .addEventListener('click', async () => {
          if (!confirm('Notu silmek istiyor musunuz?')) return;
          await fetch(`/notes/${n.id}`, {
            method: 'DELETE',
            credentials: 'same-origin'
          });
          loadAllNotes();
        });
      document.querySelector(`#note-${n.id} .edit-note`)
        .addEventListener('click', async () => {
          const txt = prompt('Notu düzenleyin:', n.content);
          if (txt == null) return;
          await fetch(`/notes/${n.id}`, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: txt })
          });
          loadAllNotes();
        });
    });

  } catch (err) {
    console.error(err);
    listEl.innerHTML = '<li>Notlar yüklenirken hata oluştu.</li>';
  }
}

// Sayfa yüklendiğinde notları getir
window.addEventListener('DOMContentLoaded', loadAllNotes);

// Note System
document.addEventListener('DOMContentLoaded', () => {
  const allNotesList = document.getElementById('allNotesList');
  const newNoteContent = document.getElementById('newNoteContent');
  const noteTags = document.getElementById('noteTags');
  const addNoteBtn = document.getElementById('addNoteBtn');

  // Load notes
  loadNotes();

  // Add note
  addNoteBtn.addEventListener('click', () => {
    const content = newNoteContent.value.trim();
    const tags = noteTags.value.trim();

    if (content) {
      addNote(content, tags);
      newNoteContent.value = '';
      noteTags.value = '';
      showToast('✅ Not başarıyla kaydedildi');
    }
  });

  // Load notes from localStorage
  function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    allNotesList.innerHTML = '';

    notes.forEach((note, index) => {
      const li = createNoteElement(note, index);
      allNotesList.appendChild(li);
    });
  }

  // Create note element
  function createNoteElement(note, index) {
    const li = document.createElement('li');
    li.className = 'note-card';

    // Add tags if they exist
    let tagsHtml = '';
    if (note.tags) {
      const tagList = note.tags.split(',').map(tag => tag.trim());
      tagsHtml = `
        <div class="note-tags">
          ${tagList.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
        </div>
      `;
    }

    // AI içerik için listeleme
    const listItems = note.content
      .split(/\n|-\s+/)
      .filter(item => item.trim() !== '')
      .map(item => `<li>${item.trim()}</li>`)
      .join('');

    li.innerHTML = `
      ${tagsHtml}
      <ul style="list-style-type: disc; padding-left: 1.2rem; color: #334155; font-weight: 500; line-height: 1.6;">
        ${listItems}
      </ul>
      <div class="note-meta">
        <small>${new Date(note.date).toLocaleString()}</small>
        <div class="note-actions">
          <button class="edit-note" data-index="${index}">✏️</button>
          <button class="delete-note" data-index="${index}">🗑️</button>
        </div>
      </div>
    `;

    li.querySelector('.delete-note').addEventListener('click', () => deleteNote(index));
    li.querySelector('.edit-note').addEventListener('click', () => editNote(index));

    return li;
  }

  // Add new note
  function addNote(content, tags) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.unshift({
      content,
      tags,
      date: new Date().toISOString()
    });
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
  }

  // Delete note
  function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
    showToast('🗑️ Not silindi');
  }

  // Edit note
  function editNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];

    newNoteContent.value = note.content;
    noteTags.value = note.tags || '';

    newNoteContent.scrollIntoView({ behavior: 'smooth' });
    newNoteContent.focus();

    deleteNote(index);
  }

  // Note search
  const noteSearch = document.getElementById('noteSearch');
  if (noteSearch) {
    noteSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const notes = document.querySelectorAll('.note-card');

      notes.forEach(note => {
        const content = note.textContent.toLowerCase();
        note.style.display = content.includes(searchTerm) ? 'block' : 'none';
      });
    });
  }
});



// // public/js/notes.js

// // Çıkış butonu
// document.getElementById('logoutBtn').addEventListener('click', async () => {
//   await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
//   location.href = '/login.html';
// });

// const listEl = document.getElementById('allNotesList');

// // 1) Tüm notları çek ve listele
// async function loadAllNotes() {
//   listEl.innerHTML = 'Yükleniyor...';
//   try {
//     const res = await fetch('/notes/all', { credentials: 'same-origin' });
//     const notes = await res.json();

//     if (!notes.length) {
//       listEl.innerHTML = '<li>Henüz bir not yok.</li>';
//       return;
//     }
//     listEl.innerHTML = notes.map(n => `
//       <li id="note-${n.id}" class="note-item">
//         <p><strong>Strateji:</strong> ${n.strategy_text}</p>
//         <p>${n.content}</p>
//         <small>${new Date(n.created_at).toLocaleString()}</small>
//         <div class="note-meta">
//           <button class="edit-note" data-id="${n.id}">Düzenle</button>
//           <button class="delete-note" data-id="${n.id}">Sil</button>
//         </div>
//       </li>
//     `).join('');

//     // Sil & Düzenle event'leri
//     notes.forEach(n => {
//       document.querySelector(`#note-${n.id} .delete-note`)
//         .addEventListener('click', async () => {
//           if (!confirm('Notu silmek istiyor musunuz?')) return;
//           await fetch(`/notes/${n.id}`, {
//             method: 'DELETE',
//             credentials: 'same-origin'
//           });
//           loadAllNotes();
//         });
//       document.querySelector(`#note-${n.id} .edit-note`)
//         .addEventListener('click', async () => {
//           const txt = prompt('Notu düzenleyin:', n.content);
//           if (txt == null) return;
//           await fetch(`/notes/${n.id}`, {
//             method: 'PUT',
//             credentials: 'same-origin',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ content: txt })
//           });
//           loadAllNotes();
//         });
//     });

//   } catch (err) {
//     console.error(err);
//     listEl.innerHTML = '<li>Notlar yüklenirken hata oluştu.</li>';
//   }
// }

// // Sayfa yüklendiğinde notları getir
// window.addEventListener('DOMContentLoaded', loadAllNotes);

// // Note System
// document.addEventListener('DOMContentLoaded', () => {
//   const allNotesList = document.getElementById('allNotesList');
//   const newNoteContent = document.getElementById('newNoteContent');
//   const noteTags = document.getElementById('noteTags');
//   const addNoteBtn = document.getElementById('addNoteBtn');

//   // Load notes
//   loadNotes();

//   // Add note
//   addNoteBtn.addEventListener('click', () => {
//     const content = newNoteContent.value.trim();
//     const tags = noteTags.value.trim();
    
//     if (content) {
//       addNote(content, tags);
//       newNoteContent.value = '';
//       noteTags.value = '';
//       showToast('✅ Not başarıyla kaydedildi');
//     }
//   });

//   // Load notes from localStorage
//   function loadNotes() {
//     const notes = JSON.parse(localStorage.getItem('notes')) || [];
//     allNotesList.innerHTML = '';
    
//     notes.forEach((note, index) => {
//       const li = createNoteElement(note, index);
//       allNotesList.appendChild(li);
//     });
//   }

//   // Create note element
//   function createNoteElement(note, index) {
//     const li = document.createElement('li');
//     li.className = 'note-card';
    
//     // Add tags if they exist
//     let tagsHtml = '';
//     if (note.tags) {
//       const tagList = note.tags.split(',').map(tag => tag.trim());
//       tagsHtml = `
//         <div class="note-tags">
//           ${tagList.map(tag => `<span class="note-tag">${tag}</span>`).join('')}
//         </div>
//       `;
//     }

//     li.innerHTML = `
//       ${tagsHtml}
//       <div class="note-text">${note.content}</div>
//       <div class="note-meta">
//         <small>${new Date(note.date).toLocaleString()}</small>
//         <div class="note-actions">
//           <button class="edit-note" data-index="${index}">✏️</button>
//           <button class="delete-note" data-index="${index}">🗑️</button>
//         </div>
//       </div>
//     `;

//     // Add event listeners
//     li.querySelector('.delete-note').addEventListener('click', () => deleteNote(index));
//     li.querySelector('.edit-note').addEventListener('click', () => editNote(index));

//     return li;
//   }

//   // Add new note
//   function addNote(content, tags) {
//     const notes = JSON.parse(localStorage.getItem('notes')) || [];
//     notes.unshift({
//       content,
//       tags,
//       date: new Date().toISOString()
//     });
//     localStorage.setItem('notes', JSON.stringify(notes));
//     loadNotes();
//   }

//   // Delete note
//   function deleteNote(index) {
//     const notes = JSON.parse(localStorage.getItem('notes')) || [];
//     notes.splice(index, 1);
//     localStorage.setItem('notes', JSON.stringify(notes));
//     loadNotes();
//     showToast('🗑️ Not silindi');
//   }

//   // Edit note
//   function editNote(index) {
//     const notes = JSON.parse(localStorage.getItem('notes')) || [];
//     const note = notes[index];
    
//     newNoteContent.value = note.content;
//     noteTags.value = note.tags || '';
    
//     // Scroll to note form
//     newNoteContent.scrollIntoView({ behavior: 'smooth' });
//     newNoteContent.focus();
    
//     // Delete the old note
//     deleteNote(index);
//   }

//   // Note search
//   const noteSearch = document.getElementById('noteSearch');
//   if (noteSearch) {
//     noteSearch.addEventListener('input', (e) => {
//       const searchTerm = e.target.value.toLowerCase();
//       const notes = document.querySelectorAll('.note-card');
      
//       notes.forEach(note => {
//         const content = note.textContent.toLowerCase();
//         note.style.display = content.includes(searchTerm) ? 'block' : 'none';
//       });
//     });
//   }
// });
