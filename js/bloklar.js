// js/bloklar.js

const newBlokName = document.getElementById('newBlokName');
const addBlokBtn = document.getElementById('addBlokBtn');
const blokListesi = document.getElementById('blokListesi');
const toastEl = document.getElementById('toast');

// Bildirim gösterme fonksiyonu (Toast)
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

// 1. Firebase'e Yeni Blok Ekleme
addBlokBtn.addEventListener('click', async () => {
  const blokAdi = newBlokName.value.trim();
  
  if (!blokAdi) {
    showToast("Lütfen bir blok adı yazın!");
    return;
  }

  try {
    // addBlokBtn.disabled = true; // Kaydederken butonu kilitleyelim
    // addBlokBtn.textContent = 'Kaydediliyor...';

    await db.collection('bloklar').add({
      ad: blokAdi,
      olusturmaTarihi: firebase.firestore.FieldValue.serverTimestamp()
    });

    newBlokName.value = ''; // Kutuyu temizle
    showToast("Blok başarıyla eklendi!");
  } catch (error) {
    console.error("Blok eklenirken hata:", error);
    showToast("Hata: Blok eklenemedi.");
  } finally {
    // addBlokBtn.disabled = false;
    // addBlokBtn.textContent = 'Kaydet';
  }
});

// 2. Firebase'den Blokları Dinleme ve Listeleme
function bloklariGetir() {
  // Bloklar koleksiyonunu oluşturulma tarihine göre dinle (Gerçek zamanlı)
  db.collection('bloklar')
    .orderBy('olusturmaTarihi', 'desc')
    .onSnapshot((snapshot) => {
      
      if (snapshot.empty) {
        blokListesi.innerHTML = `
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <p>Henüz hiç blok eklemediniz.</p>
          </div>`;
        return;
      }

      let html = '';
      snapshot.forEach(doc => {
        const blok = doc.data();
        html += `
          <div class="list-item">
            <div class="main-info">
              <span class="title-row">${blok.ad}</span>
            </div>
            <div class="right">
              <button class="icon-btn" onclick="blokSil('${doc.id}')" title="Sil">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `;
      });
      
      blokListesi.innerHTML = html;
  });
}

// 3. Blok Silme Fonksiyonu
window.blokSil = async (id) => {
  if (confirm("Bu bloğu silmek istediğinize emin misiniz? DİKKAT: Buna bağlı daireler varsa sorun yaşayabilirsiniz.")) {
    try {
      await db.collection('bloklar').doc(id).delete();
      showToast("Blok silindi.");
    } catch (error) {
      console.error("Silme hatası:", error);
      showToast("Silinemedi!");
    }
  }
};

// Sayfa ilk açıldığında listelemeyi başlat
bloklariGetir();