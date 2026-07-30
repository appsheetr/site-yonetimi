// js/bloklar.js

const newBlokName = document.getElementById('newBlokName');
const addBlokBtn = document.getElementById('addBlokBtn');
const blokListesi = document.getElementById('blokListesi');
const toastEl = document.getElementById('toast');

// Bildirim gösterme fonksiyonu (Toast)
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

// 1. Firebase'e Yeni Blok Ekleme
if (addBlokBtn) {
  addBlokBtn.addEventListener('click', async () => {
    const blokAdi = newBlokName.value.trim();
    
    if (!blokAdi) {
      showToast("Lütfen bir blok adı yazın!");
      return;
    }

    try {
      addBlokBtn.disabled = true;
      addBlokBtn.textContent = 'Kaydediliyor...';

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
      addBlokBtn.disabled = false;
      addBlokBtn.textContent = 'Kaydet';
    }
  });
}

// 2. Firebase'den Blokları Dinleme ve Listeleme
function bloklariGetir() {
  if (!blokListesi) return;

  // Bloklar koleksiyonunu oluşturulma tarihine göre dinle (Gerçek zamanlı)
  db.collection('bloklar')
    .orderBy('olusturmaTarihi', 'desc')
    .onSnapshot((snapshot) => {
      
      if (snapshot.empty) {
        blokListesi.innerHTML = `
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <p style="margin-top:8px;">Henüz hiç blok eklemediniz.</p>
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
              <!-- Düzenle Butonu -->
              <button class="icon-btn" onclick="blokDuzenle('${doc.id}', '${blok.ad}')" title="Düzenle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <!-- Sil Butonu -->
              <button class="icon-btn" onclick="blokSil('${doc.id}')" title="Sil">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      });
      
      blokListesi.innerHTML = html;
  }, (error) => {
      console.error("Bloklar çekilemedi:", error);
      blokListesi.innerHTML = `<div class="empty-state"><p>Veriler yüklenirken hata oluştu.</p></div>`;
  });
}

// 3. Blok Silme Fonksiyonu
window.blokSil = async (id) => {
  if (confirm("Bu bloğu silmek istediğinize emin misiniz?")) {
    try {
      await db.collection('bloklar').doc(id).delete();
      showToast("Blok silindi.");
    } catch (error) {
      console.error("Silme hatası:", error);
      showToast("Silinemedi!");
    }
  }
};

// 4. Blok Düzenleme Fonksiyonu
window.blokDuzenle = async (id, mevcutAd) => {
  // Kullanıcıya mevcut adı gösterip yeni adı girmesini istiyoruz
  const yeniAd = prompt("Yeni blok adını girin:", mevcutAd);
  
  // Eğer kullanıcı İptal'e basmadıysa, boş bırakmadıysa ve isim gerçekten değiştiyse kaydet
  if (yeniAd !== null && yeniAd.trim() !== "" && yeniAd.trim() !== mevcutAd) {
    try {
      await db.collection('bloklar').doc(id).update({
        ad: yeniAd.trim()
      });
      showToast("Blok adı güncellendi.");
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      showToast("Hata: Güncellenemedi!");
    }
  }
};

// Sayfa ilk açıldığında listelemeyi başlat
bloklariGetir();