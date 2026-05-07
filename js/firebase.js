/* =============================================
   FIREBASE.JS - Conexión con Firebase
   Smart Finance Personal - Colombia
   ============================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALVnBZLoUUet_SZlOBSW77AEXoWZlLTkY",
  authDomain: "smart-finance-pro-aa23b.firebaseapp.com",
  projectId: "smart-finance-pro-aa23b",
  storageBucket: "smart-finance-pro-aa23b.firebasestorage.app",
  messagingSenderId: "562241668893",
  appId: "1:562241668893:web:d24860a77e6800b68103f4"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();

let currentUser = null;

// ---- Guardar en la nube ----
window.saveDataCloud = async function() {
  if (!currentUser) {
    try { localStorage.setItem('sfp_data', JSON.stringify(APP)); } catch(e) {}
    return;
  }
  try {
    await setDoc(doc(db, 'users', currentUser.uid), { data: JSON.stringify(APP) });
  } catch(e) {
    console.warn('Error guardando Firebase:', e);
    try { localStorage.setItem('sfp_data', JSON.stringify(APP)); } catch(_) {}
  }
};

// ---- Cargar desde la nube ----
window.loadDataCloud = async function() {
  if (!currentUser) {
    try {
      const raw = localStorage.getItem('sfp_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        APP = Object.assign(getDefaultData(), parsed);
        APP.profile = Object.assign(getDefaultData().profile, parsed.profile || {});
        if (!APP.savingGoals) APP.savingGoals = [];
        if (!APP.savingMovements) APP.savingMovements = [];
        if (!APP.investments) APP.investments = [];
        if (!APP.debts) APP.debts = [];
        if (!APP.learnedRules) APP.learnedRules = {};
        return true;
      }
    } catch(e) {}
    return false;
  }
  try {
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    if (snap.exists()) {
      const parsed = JSON.parse(snap.data().data);
      APP = Object.assign(getDefaultData(), parsed);
      APP.profile = Object.assign(getDefaultData().profile, parsed.profile || {});
      if (!APP.savingGoals) APP.savingGoals = [];
      if (!APP.savingMovements) APP.savingMovements = [];
      if (!APP.investments) APP.investments = [];
      if (!APP.debts) APP.debts = [];
      if (!APP.learnedRules) APP.learnedRules = {};
      return true;
    }
    return false;
  } catch(e) {
    console.warn('Error cargando Firebase:', e);
    return false;
  }
};

// ---- Login con Google ----
window.loginGoogle = async function() {
  try {
    await signInWithPopup(auth, provider);
  } catch(e) {
    console.error('Error login:', e);
    showToast('Error al iniciar sesión con Google', 'error');
  }
};

// ---- Cerrar sesión ----
window.logoutUser = async function() {
  if (!confirm('¿Seguro que quieres cerrar sesión?')) return;
  await signOut(auth);
  location.reload();
};

window.getCurrentUser = () => currentUser;

// ---- Detectar si el usuario está logueado ----
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  // Ocultar splash siempre
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => { splash.style.display = 'none'; }, 400);
  }

  if (user) {
    // Ocultar login
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.classList.add('hidden');

    // Cargar datos
    const hasData = await window.loadDataCloud();

    // Mostrar app
    if (!hasData || !APP.profile.name) {
      showOnboarding();
    } else {
      startApp();
    }
  } else {
    // Mostrar pantalla de login
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) loginScreen.classList.remove('hidden');
  }
});
