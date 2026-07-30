// ============================================================
// BURAYI DOLDUR — Firebase Console > Project Settings > Your apps
// bölümünden aldığın bilgileri gir. Önceki basit uygulamada
// zaten bir proje oluşturduysan, oradaki bilgileri aynen kullanabilirsin.
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCKOZExdBwI-KThdaAcDShf6WHXBMy4iNw",
  authDomain: "site-yonetim-18c52.firebaseapp.com",
  projectId: "site-yonetim-18c52",
  storageBucket: "site-yonetim-18c52.firebasestorage.app",
  messagingSenderId: "655821638839",
  appId: "1:655821638839:web:39f85dac67371bf9201132"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
