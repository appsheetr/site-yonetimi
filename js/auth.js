/* ============================================================
   auth.js — Giriş / Kayıt / Rol yönetimi (Faz 0)
   ============================================================ */

// ---------- Ortak yardımcılar (nav.js de bunları kullanacak) ----------
const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---------- Uygulama genelinde kullanılacak durum ----------
// nav.js de dahil her dosya bu nesneyi okuyarak "giriş yapan kim, rolü ne" bilgisine ulaşır.
const AppState = {
  uid: null,
  email: null,
  ad: '',
  rol: null,       // 'yonetici' | 'yetkili' | 'sakin' | 'beklemede'
  daireId: null
};

let registerMode = false;

// ---------- Kayıt / Giriş formu davranışı ----------
$('#showRegister').addEventListener('click', () => {
  registerMode = !registerMode;
  $('#nameField').classList.toggle('hidden', !registerMode);
  $('#showRegister').textContent = registerMode
    ? 'Zaten hesabın var mı? Giriş yap'
    : 'Henüz hesabın yok mu? Hesap oluştur';
  $('#loginBtn').textContent = registerMode ? 'Hesap oluştur' : 'Giriş yap';
  $('#loginError').textContent = '';
});

$('#loginBtn').addEventListener('click', async () => {
  const email = $('#loginEmail').value.trim();
  const pass = $('#loginPassword').value;
  const errorEl = $('#loginError');
  errorEl.textContent = '';

  if (!email || !pass) { errorEl.textContent = 'E-posta ve şifre gerekli.'; return; }

  try {
    if (registerMode) {
      const ad = $('#loginName').value.trim();
      if (!ad) { errorEl.textContent = 'Ad soyad gerekli.'; return; }
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      // Yeni kullanıcı dokümanı: güvenlik kuralı gereği rol her zaman 'beklemede' başlar.
      await db.collection('users').doc(cred.user.uid).set({
        ad,
        email,
        rol: 'beklemede',
        daireId: null,
        telefon: '',
        aktif: true,
        olusturmaTarihi: firebase.firestore.FieldValue.serverTimestamp()
      });
      // onAuthStateChanged dinleyicisini beklemeden doğrudan bekleme ekranına geç:
      // createUserWithEmailAndPassword otomatik giriş yaptırdığı için dinleyici de
      // tetiklenecek, ama bu satırda zaten doc'un var olduğunu biliyoruz.
      AppState.uid = cred.user.uid; AppState.email = email; AppState.ad = ad;
      AppState.rol = 'beklemede'; AppState.daireId = null;
      showScreen('waiting');
      showToast('Hesap oluşturuldu');
    } else {
      await auth.signInWithEmailAndPassword(email, pass);
    }
  } catch (err) {
    errorEl.textContent = translateAuthError(err);
  }
});

function translateAuthError(err) {
  const map = {
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/user-not-found': 'Bu e-posta ile hesap bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
    'auth/email-already-in-use': 'Bu e-posta zaten kayıtlı, giriş yapmayı dene.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
    'auth/network-request-failed': 'İnternet bağlantısı yok.'
  };
  return map[err.code] || ('Bir hata oluştu: ' + (err.message || 'bilinmeyen hata'));
}

function logout() { auth.signOut(); }
$('#logoutBtn').addEventListener('click', logout);
$('#waitingLogoutBtn').addEventListener('click', logout);

// ---------- Giriş durumu değiştiğinde hangi ekranı göstereceğimize karar ver ----------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    AppState.uid = null; AppState.rol = null; AppState.daireId = null;
    showScreen('login');
    return;
  }

  AppState.uid = user.uid;
  AppState.email = user.email;

  try {
    const data = await getUserDocWithRetry(user.uid);
    if (!data) {
      // Birkaç denemeden sonra hâlâ doküman yoksa gerçekten bir sorun var demektir.
      showToast('Hesap bilgisi bulunamadı, tekrar dene');
      await auth.signOut();
      return;
    }
    AppState.ad = data.ad || '';
    AppState.rol = data.rol;
    AppState.daireId = data.daireId || null;

    if (data.rol === 'beklemede') {
      showScreen('waiting');
    } else {
      showScreen('main');
      $('#drawerWho').textContent = AppState.ad || AppState.email;
      $('#drawerMail').textContent = AppState.email;
      $('#roleBadge').textContent = roleLabel(AppState.rol);
      renderDrawerMenu(); // nav.js içinde tanımlı
      switchView('ozet');
    }
  } catch (err) {
    console.error(err);
    showToast('Kullanıcı bilgisi okunamadı');
  }
});

// Firestore dokümanı, kayıt tamamlanır tamamlanmaz henüz yazılmamış olabilir
// (createUserWithEmailAndPassword otomatik giriş yaptırır, doc.set() ile arada küçük bir gecikme olabilir).
// Bu yüzden hemen pes etmek yerine birkaç kez, kısa aralıklarla tekrar deniyoruz.
async function getUserDocWithRetry(uid, attemptsLeft = 4) {
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists) return doc.data();
  if (attemptsLeft <= 0) return null;
  await new Promise(r => setTimeout(r, 400));
  return getUserDocWithRetry(uid, attemptsLeft - 1);
}

function roleLabel(rol) {
  return { yonetici: 'Yönetici', yetkili: 'Yetkili Sakin', sakin: 'Sakin' }[rol] || rol;
}

function showScreen(name) {
  $('#loginScreen').classList.toggle('hidden', name !== 'login');
  $('#waitingScreen').classList.toggle('hidden', name !== 'waiting');
  $('#mainScreen').classList.toggle('hidden', name !== 'main');
}
