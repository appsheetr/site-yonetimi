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
      window.location.reload(); 
    });
  });
}

// 3. Menü Öğeleri ve Orijinal İkonlar
const menuItems = [
  { 
    id: 'ozet', 
    title: 'Özet', 
    view: 'view-ozet', 
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>' 
  },
  { 
    id: 'bloklar', 
    title: 'Bloklar', 
    view: 'view-bloklar', 
    icon: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
    soon: true
  },
  { 
    id: 'daireler', 
    title: 'Daireler', 
    view: 'view-generic', 
    icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>',
    soon: true, locked: true 
  },
  { 
    id: 'sakinler', 
    title: 'Site Sakinleri', 
    view: 'view-generic', 
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
    soon: true, locked: true 
  },
  { 
    id: 'odemeler', 
    title: 'Ödemeler', 
    view: 'view-generic', 
    icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
    soon: true, locked: true 
  },
  { 
    id: 'masraflar', 
    title: 'Masraflar', 
    view: 'view-generic', 
    icon: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>',
    soon: true, locked: true 
  },
  { 
    id: 'duyurular', 
    title: 'Duyurular & Haberler', 
    view: 'view-generic', 
    icon: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>',
    soon: true, locked: true 
  },
  { 
    id: 'sikayet', 
    title: 'Şikayet & Öneri', 
    view: 'view-generic', 
    icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
    soon: true, locked: true 
  }
];

function renderMenu() {
  if (!drawerMenu) return;
  
  drawerMenu.innerHTML = menuItems.map(item => {
    const isLocked = item.locked ? 'locked' : '';
    const soonBadge = item.soon ? '<span class="soon-badge">Yakında</span>' : '';
    
    return `
      <button class="drawer-item ${isLocked}" onclick="switchView('${item.view}')" ${item.locked ? 'disabled' : ''}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${item.icon}
        </svg>
        ${item.title}
        ${soonBadge}
      </button>
    `;
  }).join('');
}

// 4. Sayfalar Arası Geçiş Fonksiyonu
window.switchView = function(viewId) {
  document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
  
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.remove('hidden');
  } else {
    // Eğer modül henüz kodlanmadıysa generic yakında ekranını göster
    document.getElementById('view-generic').classList.remove('hidden');
  }
  
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
};

// Menüyü ekrana çiz
renderMenu();