// Theme System
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.innerHTML = '🌙';
  const themeToggleContainer = document.querySelector('.theme-toggle-container');
  if (themeToggleContainer) {
    themeToggleContainer.appendChild(themeToggle);
  } else {
    document.body.appendChild(themeToggle);
  }
  // Ek CSS: Sağ üstte sabit ve header ile hizalı görünüm
  const style = document.createElement('style');
  style.innerHTML = `
    .theme-toggle-container {
      position: fixed;
      top: 1.5rem;
      right: 2rem;
      z-index: 1200;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: auto;
      pointer-events: none;
    }
    .theme-toggle {
      pointer-events: auto;
      position: static;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.45rem;
      cursor: pointer;
      transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
      box-shadow: 0 2px 8px var(--shadow-color);
      margin-left: 0.5rem;
    }
    .theme-toggle:hover {
      background: var(--primary);
      color: #fff;
      transform: scale(1.08);
    }
  `;
  document.head.appendChild(style);

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';

  // Theme toggle handler
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    // Arka planı ve ana kutuları CSS değişkenleriyle güncelle
    document.body.style.background = '';
    document.documentElement.style.background = '';
  });

  // Add ripple effect to all buttons
  document.querySelectorAll('button').forEach(button => {
    button.classList.add('ripple');
  });

  // Toast notification system
  window.showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : '❌'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Note search functionality
  const noteSearch = document.querySelector('.note-search');
  if (noteSearch) {
    noteSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll('#notesList li').forEach(note => {
        const text = note.textContent.toLowerCase();
        note.style.display = text.includes(searchTerm) ? 'block' : 'none';
      });
    });
  }

  // Random pastel color for notes
  const pastelColors = [
    'var(--pastel-blue)',
    'var(--pastel-pink)',
    'var(--pastel-green)',
    'var(--pastel-yellow)',
    'var(--pastel-purple)'
  ];

  document.querySelectorAll('#notesList li').forEach(note => {
    const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    note.style.backgroundColor = randomColor;
  });

  // Add page transition class
  document.body.classList.add('page-transition');
}); 