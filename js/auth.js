// js/auth.js

const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const loginName = document.getElementById('loginName'); // Kayıt sırasında görünür olacak
const loginError = document.getElementById('loginError');
const showRegisterBtn = document.getElementById('showRegister');

let isRegisterMode = false;

// Kayıt / Giriş Modu Değiştirme
showRegisterBtn.addEventListener('click', () => {
  isRegisterMode = !isRegisterMode;
  if (isRegisterMode) {
    document.getElementById('nameField').classList.remove('hidden');
    loginBtn.textContent = 'Kayıt Ol';
    showRegisterBtn.textContent = 'Zaten hesabın var mı? Giriş yap';
  } else {
    document.getElementById('nameField').classList.add('hidden');
    loginBtn.textContent = 'Giriş yap';
    showRegisterBtn.textContent = 'Henüz hesabın yok mu? Hesap oluştur';
  }
});

// Giriş veya Kayıt İşlemi
loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  const fullName = loginName.value.trim();
  loginError.textContent = '';

  if (!email || !password) {
    loginError.textContent = 'Lütfen e-posta ve şifrenizi girin.';
    return;
  }

  try {
    if (isRegisterMode) {
      // 1. Yeni Kullanıcı Oluşturma
      if (!fullName) {
        loginError.textContent = 'Lütfen adınızı ve soyadınızı girin.';
        return;
      }
      
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // 2. Doğrulama E-postası Gönderme
      await user.sendEmailVerification();

      // 3. Firestore'a Kullanıcı Bilgisini Yazma (Varsayılan olarak "sakin" ve onaysız)
      await db.collection('users').doc(user.uid).set({
        ad: fullName,
        email: email,
        rol: 'sakin',
        aktif: false, // Yönetici onaylayana kadar pasif
        daireId: null,
        telefon: "",
        olusturmaTarihi: firebase.firestore.FieldValue.serverTimestamp()
      });

      loginError.style.color = "green";
      loginError.textContent = 'Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.';
      auth.signOut(); // Doğrulama yapmadan girmemesi için çıkış yaptırıyoruz

    } else {
      // 4. Mevcut Kullanıcı Girişi
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        loginError.textContent = 'Lütfen önce e-posta adresinizi doğrulayın.';
        auth.signOut();
        return;
      }

      // Kullanıcının veritabanındaki durumunu kontrol et
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.aktif === false) {
           // index.html'deki Onay Bekliyor ekranını göster
           document.getElementById('loginScreen').classList.add('hidden');
           document.getElementById('waitingScreen').classList.remove('hidden');
        } else {
           // Aktif kullanıcı, ana uygulamaya yönlendir
           document.getElementById('loginScreen').classList.add('hidden');
           document.getElementById('mainScreen').classList.remove('hidden');
           // Burada yetkiye göre menüleri yükleme fonksiyonunu çağırabilirsin
        }
      }
    }
  } catch (error) {
    console.error("Auth Hatası:", error);
    loginError.style.color = "var(--red)";
    loginError.textContent = 'İşlem başarısız: ' + error.message;
  }
});