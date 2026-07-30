/* ============================================================
   nav.js — Kenar menü (drawer) ve sayfa geçişleri
   Yeni bir modül faz'ı tamamlandığında burada sadece o modülün
   "ready: false" değerini "ready: true" yapıp, ilgili view'i
   ekleyeceğiz. Menü listesini elle değiştirmemiz gerekmeyecek.
   ============================================================ */

const MENU_ITEMS = [
  { id: 'ozet', label: 'Özet', roles: ['yonetici', 'yetkili', 'sakin'], ready: true,
    icon: `<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>` },

  { id: 'bloklar', label: 'Bloklar', roles: ['yonetici', 'yetkili'], ready: false,
    icon: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>` },

  { id: 'daireler', label: 'Daireler', roles: ['yonetici', 'yetkili'], ready: false,
    icon: `<rect x="4" y="3" width="16" height="18" rx="1"/><line x1="9" y1="8" x2="9" y2="8.01"/><line x1="15" y1="8" x2="15" y2="8.01"/><line x1="9" y1="13" x2="9" y2="13.01"/><line x1="15" y1="13" x2="15" y2="13.01"/>` },

  { id: 'sakinler', label: 'Site Sakinleri', roles: ['yonetici'], ready: false,
    icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>` },

  { id: 'odemeler', label: 'Ödemeler', roles: ['yonetici', 'yetkili'], ready: false,
    icon: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16"/>` },

  { id: 'onaybekleyenler', label: 'Onay Bekleyenler', roles: ['sakin', 'yetkili'], ready: false,
    icon: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>` },

  { id: 'masraflar', label: 'Masraflar', roles: ['yonetici', 'yetkili'], ready: false,
    icon: `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>` },

  { id: 'duyurular', label: 'Duyurular & Haberler', roles: ['yonetici', 'yetkili', 'sakin'], ready: false,
    icon: `<path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.2 3"/>` },

  { id: 'sikayetler', label: 'Şikayet & Öneri', roles: ['yonetici', 'yetkili', 'sakin'], ready: false,
    icon: `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>` }
];

let currentView = 'ozet';

// ---------- Drawer aç/kapa ----------
$('#menuBtn').addEventListener('click', () => toggleDrawer(true));
$('#drawerOverlay').addEventListener('click', () => toggleDrawer(false));

function toggleDrawer(open) {
  $('#drawer').classList.toggle('open', open);
  $('#drawerOverlay').classList.toggle('open', open);
}

// ---------- Menüyü kullanıcının rolüne göre çiz ----------
function renderDrawerMenu() {
  const wrap = $('#drawerMenu');
  wrap.innerHTML = '';
  MENU_ITEMS
    .filter(item => item.roles.includes(AppState.rol))
    .forEach(item => {
      const btn = el('button', 'drawer-item' + (item.ready ? '' : ' locked'));
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
        <span>${item.label}</span>
        ${item.ready ? '' : '<span class="soon-badge">Yakında</span>'}
      `;
      btn.addEventListener('click', () => {
        switchView(item.id);
        toggleDrawer(false);
      });
      wrap.appendChild(btn);
    });
}

// ---------- Sayfa geçişi ----------
function switchView(viewId) {
  currentView = viewId;
  const item = MENU_ITEMS.find(m => m.id === viewId);

  $('#topbarTitle').textContent = item ? item.label : '';

  if (viewId === 'ozet') {
    $('#view-ozet').classList.remove('hidden');
    $('#view-generic').classList.add('hidden');
  } else {
    $('#view-ozet').classList.add('hidden');
    $('#view-generic').classList.remove('hidden');
    $('#genericTitle').textContent = item ? item.label : '';
    $('#genericSoonPill').textContent = 'Yakında';
    $('#genericDesc').textContent = `"${item ? item.label : ''}" modülünü ilerleyen bir fazda birlikte kuracağız. Şimdilik sadece giriş ve menü yapısını tamamlıyoruz.`;
  }

  // Menüdeki aktif öğeyi vurgula
  document.querySelectorAll('.drawer-item').forEach(btn => {
    const label = btn.querySelector('span')?.textContent;
    btn.classList.toggle('active', item && label === item.label);
  });
}
