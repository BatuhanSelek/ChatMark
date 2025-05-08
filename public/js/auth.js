// public/auth.js

// Kayıt
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const resDiv = document.getElementById('registerResult');
    resDiv.textContent = 'Kayıt yapılıyor...';
  
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({name,email,password})
      });
      const data = await res.json();
      if (data.success) {
        resDiv.textContent = 'Kayıt başarılı! Anasayfaya yönlendiriliyorsunuz...';
        setTimeout(()=> location.href='/', 1000);
      } else {
        resDiv.textContent = data.error || 'Kayıt başarısız.';
      }
    } catch (err) {
      resDiv.textContent = 'Sunucu hatası.';
    }
  });
  
  // Giriş
  document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const resDiv = document.getElementById('loginResult');
    resDiv.textContent = 'Giriş yapılıyor...';
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email,password})
      });
      const data = await res.json();
      if (data.success) {
        resDiv.textContent = 'Giriş başarılı! Anasayfaya yönlendiriliyorsunuz...';
        setTimeout(()=> location.href='/', 1000);
      } else {
        resDiv.textContent = data.error || 'Giriş başarısız.';
      }
    } catch {
      resDiv.textContent = 'Sunucu hatası.';
    }
  });
  
  // Çıkış (opsiyonel, index.html’e bir “Çıkış” butonu eklersen kullanabilirsin)
  async function logout() {
    await fetch('/logout', { method:'POST' });
    location.href = '/login.html';
  }
  