// js/nav.js

const menuBtn = document.getElementById('menuBtn');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerMenu = document.getElementById('drawerMenu');
const logoutBtn = document.getElementById('logoutBtn');

// 1. Menüyü Açma / Kapama İşlemleri
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
  });
}

if (drawerOverlay) {
  drawerOverlay.addEventListener('click', () => {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
  });
}

// 2. Çıkış Yapma İşlemi
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      window.location.reload(); // Çıkış yapınca sayfayı yenile
    });
  });
}

// 3. Menü Öğelerini Oluşturma ve Sayfa Geçişleri
const menuItems = [
  { id: 'ozet', title: 'Özet', view: 'view-ozet' },
  { id: 'bloklar', title: 'Bloklar', view: 'view-bloklar' },
  { id: 'daireler', title: 'Daireler', view: 'view-generic', locked: true },
  { id: 'sakinler', title: 'Site Sakinleri', view: 'view-generic', locked: true }
];

function renderMenu() {
  if (!drawerMenu) return;
  
  drawerMenu.innerHTML = menuItems.map(item => {
    const isLocked = item.locked ? 'locked' : '';
    const soonBadge = item.locked ? '<span class="soon-badge">Yakında</span>' : '';
    
    return `
      <button class="drawer-item ${isLocked}" onclick="switchView('${item.view}')" ${item.locked ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
        ${item.title}
        ${soonBadge}
      </button>
    `;
  }).join('');
}

// Sayfalar Arası Geçiş Fonksiyonu
window.switchView = function(viewId) {
  // Tüm view'leri gizle
  document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
  // İstenen view'i göster
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.remove('hidden');
  
  // Menüyü kapat
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
};

// Menüyü ekrana çiz
renderMenu();