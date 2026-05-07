/* =============================================
   FIREBASE.JS - Conexión con Firebase
   Smart Finance Personal - Colombia
   ============================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- Tu configuración de Firebase ----
const firebaseConfig = {
  apiKey: "AIzaSyALVnBZLoUUet_SZlOBSW77AEXoWZlLTkY",
  authDomain: "smart-finance-pro-aa23b.firebaseapp.com",
  projectId: "smart-finance-pro-aa23b",
  storageBucket: "smart-finance-pro-aa23b.firebasestorage.app",
  messagingSenderId: "562241668893",
  appId: "1:562241668893:web:d24860a77e6800b68103f4"
};

// ---- Inicializar Firebase ----
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();

// ---- Usuario actual ----
let currentUser = null;

// ---- Guardar datos en la nube ----
async function saveDataCloud() {
  if (!currentUser) {
    // Si no hay usuario, guardar en localStorage como antes
    try {
      localStorage.setItem('sfp_data', JSON.stringify(APP));
    } catch (e) {
      console.warn('Error guardando en localStorage', e);
    }
    return;
  }
  try {
    const ref = doc(db, 'users', currentUser.uid);
    await setDoc(ref, { data: JSON.stringify(APP) });
  } catch (e) {
    console.warn('Error guardando en Firebase', e);
    // Respaldo en localStorage
    try { localStorage.setItem('sfp_data', JSON.stringify(APP)); } catch (_) {}
  }
}

// ---- Cargar datos desde la nube ----
async function loadDataCloud() {
  if (!currentUser) {
    // Sin usuario, cargar desde localStorage
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
        if (typeof APP.saldo !== 'number') APP.saldo = 0;
        return true;
      }
    } catch (e) {}
    return false;
  }
  try {
    const ref = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const parsed = JSON.parse(snap.data().data);
      APP = Object.assign(getDefaultData(), parsed);
      APP.profile = Object.assign(getDefaultData().profile, parsed.profile || {});
      if (!APP.savingGoals) APP.savingGoals = [];
      if (!APP.savingMovements) APP.savingMovements = [];
      if (!APP.investments) APP.investments = [];
      if (!APP.debts) APP.debts = [];
      if (!APP.learnedRules) APP.learnedRules = {};
      if (typeof APP.saldo !== 'number') APP.saldo = 0;
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Error cargando desde Firebase', e);
    return false;
  }
}

// ---- Login con Google ----
async function loginGoogle() {
  try {
    await signInWithPopup(auth, provider);
    // onAuthStateChanged se encarga del resto
  } catch (e) {
    console.error('Error al iniciar sesión', e);
    showToast('Error al iniciar sesión con Google', 'error');
  }
}

// ---- Cerrar sesión ----
async function logoutUser() {
  if (!confirm('¿Seguro que quieres cerrar sesión?')) return;
  try {
    await signOut(auth);
    showToast('Sesión cerrada', 'success');
  } catch (e) {
    console.error('Error cerrando sesión', e);
  }
}

// ---- Escuchar cambios de sesión ----
function initAuth(onLogin, onLogout) {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      onLogin(user);
    } else {
      onLogout();
    }
  });
}

// ---- Exponer funciones globalmente ----
window.saveDataCloud = saveDataCloud;
window.loadDataCloud = loadDataCloud;
window.loginGoogle = loginGoogle;
window.logoutUser = logoutUser;
window.initAuth = initAuth;
window.getCurrentUser = () => currentUser;

// ---- Llamar a app.js cuando Firebase esté listo ----
window._firebaseInitialized = true;
if (typeof window.onFirebaseReady === 'function') {
  window.onFirebaseReady();
} else {
  // app.js aún no cargó, esperar
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof window.onFirebaseReady === 'function') {
      window.onFirebaseReady();
    }
  });
}
