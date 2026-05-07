/* =============================================
   DATA.JS - Motor de datos y constantes
   Smart Finance Personal - Colombia
   ============================================= */

'use strict';

// ---- Indicadores Colombia 2026 ----
const COLOMBIA = {
  salarioMinimo: 1750905,
  auxilioTransporte: 249095,
  salarioVital: 2000000,
  inflacionAnual: 5.56,
  inflacionMensual: 0.78,
  interesBC: 17.84,
  tasaUsura: 26.76,
  mejorCDT: 13.3,
  referenciaCDT: { min: 9, max: 13.3 },
  año: 2026,
  fuente: 'DANE/Superfinanciera Abr 2026'
};

// ---- Tipos de ingresos ----
const TIPOS_INGRESO = [
  { id: 'salario', label: 'Salario', icon: 'fa-briefcase' },
  { id: 'extras_comisiones', label: 'Horas extra / Comisiones', icon: 'fa-clock' },
  { id: 'trabajo_ocasional', label: 'Trabajo ocasional', icon: 'fa-handshake' },
  { id: 'regalo', label: 'Regalo', icon: 'fa-gift' },
  { id: 'venta', label: 'Venta', icon: 'fa-tags' },
  { id: 'otro_trabajo', label: 'Otro trabajo', icon: 'fa-tools' },
  { id: 'no_determinado', label: 'No determinado', icon: 'fa-question' },
  { id: 'novio', label: 'Ingreso de novio/a', icon: 'fa-heart' },
  { id: 'sugar', label: 'Ingreso de sugar', icon: 'fa-star' },
  { id: 'rendimiento_cdt', label: 'Bolsillo alto rendimiento / CDT', icon: 'fa-piggy-bank' },
  { id: 'dividendo_bolsa', label: 'Dividendo bolsa de valores', icon: 'fa-chart-line' },
  { id: 'viaticos', label: 'Viáticos', icon: 'fa-plane' },
  { id: 'azar', label: 'Juegos de azar (ganancia)', icon: 'fa-dice' },
  { id: 'encontre_plata', label: 'Me encontré plata', icon: 'fa-coins' },
  { id: 'prestamo_recibido', label: 'Plata que me prestaron', icon: 'fa-hand-holding-dollar', isDebt: true },
  { id: 'pension', label: 'Pensión', icon: 'fa-umbrella' },
  { id: 'negocio', label: 'Negocio (especificar)', icon: 'fa-store', needsDetail: true },
  { id: 'inversion_retiro', label: 'Inversión / rendimiento', icon: 'fa-chart-bar' },
  { id: 'otro', label: 'Otro', icon: 'fa-circle-plus' }
];

// ---- Tipos de gastos ----
const TIPOS_GASTO = [
  { id: 'servicios', label: 'Servicios públicos/privados', icon: 'fa-bolt' },
  { id: 'hogar', label: 'Hogar', icon: 'fa-home' },
  { id: 'alimentacion', label: 'Alimentación', icon: 'fa-utensils' },
  { id: 'reparacion', label: 'Reparación / Mantenimiento', icon: 'fa-wrench' },
  { id: 'aseo_hogar', label: 'Aseo hogar', icon: 'fa-broom' },
  { id: 'gusticos', label: 'Gusticos / Antojos', icon: 'fa-candy-cane', isRisk: true },
  { id: 'pareja', label: 'Pareja', icon: 'fa-heart' },
  { id: 'hijos', label: 'Hijos', icon: 'fa-baby' },
  { id: 'familiar', label: 'Familiar', icon: 'fa-users' },
  { id: 'educacion', label: 'Educación', icon: 'fa-graduation-cap' },
  { id: 'transporte', label: 'Pasajes / Transporte', icon: 'fa-bus' },
  { id: 'viaje', label: 'Viaje / Paseo', icon: 'fa-plane-departure' },
  { id: 'entretenimiento', label: 'Entretenimiento', icon: 'fa-gamepad', isRisk: true },
  { id: 'gastos_malos', label: 'Gastos malos', icon: 'fa-skull-crossbones', isRisk: true, isBad: true },
  { id: 'salud', label: 'Salud', icon: 'fa-heart-pulse' },
  { id: 'deporte', label: 'Deporte / Ejercicio', icon: 'fa-dumbbell' },
  { id: 'inmueble', label: 'Compra de inmueble', icon: 'fa-building' },
  { id: 'empleado', label: 'Pagarle a empleado', icon: 'fa-id-card' },
  { id: 'no_det_gasto', label: 'No determinado', icon: 'fa-question' },
  { id: 'mascotas', label: 'Mascotas', icon: 'fa-paw' },
  { id: 'regalos', label: 'Regalos', icon: 'fa-gift' },
  { id: 'impuestos', label: 'Impuestos', icon: 'fa-file-invoice' },
  { id: 'ropa', label: 'Ropa y zapatos', icon: 'fa-shirt' },
  { id: 'tecnologia', label: 'Tecnología', icon: 'fa-laptop' },
  { id: 'accesorios', label: 'Accesorios', icon: 'fa-glasses' },
  { id: 'aseo_personal', label: 'Aseo personal', icon: 'fa-soap' },
  { id: 'perdida', label: 'Se me perdió', icon: 'fa-magnifying-glass' },
  { id: 'belleza', label: 'Belleza personal', icon: 'fa-scissors' },
  { id: 'robo', label: 'Me robaron', icon: 'fa-mask' },
  { id: 'seg_social', label: 'Seguridad social (salud, pensión, ARL)', icon: 'fa-shield-halved' },
  { id: 'vehiculo', label: 'Vehículo (carro/moto)', icon: 'fa-car', hasSubtype: true },
  { id: 'azar_gasto', label: 'Juegos de azar', icon: 'fa-dice', isRisk: true },
  { id: 'otro_gasto', label: 'Otro', icon: 'fa-circle-plus' }
];

// Subtipos de vehículo
const SUBTIPOS_VEHICULO = ['Gasolina', 'Aceite', 'Repuestos', 'Parqueadero', 'Seguro', 'Lujos', 'Revisión', 'Otros'];

// ---- Tipos de inversión ----
const TIPOS_INVERSION = [
  { id: 'proyecto', label: 'Nuevo proyecto', icon: 'fa-rocket' },
  { id: 'prestar_con_interes', label: 'Prestar plata con interés', icon: 'fa-hand-holding-dollar' },
  { id: 'cursos', label: 'Curso / Formación', icon: 'fa-graduation-cap' },
  { id: 'bolsa', label: 'Bolsa de valores', icon: 'fa-chart-line' },
  { id: 'activo_productivo', label: 'Activo productivo (casa, moto, carro)', icon: 'fa-house-chimney-window' },
  { id: 'materiales', label: 'Materiales y herramientas', icon: 'fa-screwdriver-wrench' },
  { id: 'lote', label: 'Lote / Terreno', icon: 'fa-map-location' },
  { id: 'negocio_inv', label: 'Negocio (especificar)', icon: 'fa-store', needsDetail: true },
  { id: 'cdt_inv', label: 'CDT / Bolsillo de alto rendimiento', icon: 'fa-piggy-bank' },
  { id: 'otro_inv', label: 'Otra inversión', icon: 'fa-circle-plus' }
];

// ---- Tipos de ahorro ----
const TIPOS_AHORRO = [
  { id: 'proyecto_ahorro', label: 'Proyecto', icon: 'fa-lightbulb' },
  { id: 'inmueble_ahorro', label: 'Compra de inmueble / objeto', icon: 'fa-building' },
  { id: 'estudio', label: 'Estudio', icon: 'fa-graduation-cap' },
  { id: 'emergencia', label: 'Fondo de emergencia', icon: 'fa-shield-halved' },
  { id: 'viaje_ahorro', label: 'Viaje', icon: 'fa-plane' },
  { id: 'otro_ahorro', label: 'Otro', icon: 'fa-piggy-bank' }
];

// ---- Tipos de deuda ----
const TIPOS_DEUDA = [
  { id: 'hipotecario', label: 'Hipotecario', icon: 'fa-house' },
  { id: 'cuota_cuota', label: 'Cuota a cuota', icon: 'fa-calendar-check' },
  { id: 'addi', label: 'Addi / Compra ya', icon: 'fa-mobile-screen' },
  { id: 'tarjeta', label: 'Tarjeta de crédito', icon: 'fa-credit-card' },
  { id: 'credito_bancario', label: 'Crédito bancario', icon: 'fa-university' },
  { id: 'vehicular', label: 'Crédito vehicular', icon: 'fa-car' },
  { id: 'vivienda', label: 'Crédito de vivienda', icon: 'fa-house-chimney' },
  { id: 'emergencia_deuda', label: 'Deuda de emergencia', icon: 'fa-triangle-exclamation' },
  { id: 'amigo', label: 'Deuda a amigo / familiar', icon: 'fa-user-friends' },
  { id: 'otro_deuda', label: 'Otra deuda', icon: 'fa-circle-plus' }
];

// ---- Estructura inicial de datos ----
function getDefaultData() {
  return {
    appVersion: '1.0.0',
    country: 'CO',
    currency: 'COP',
    theme: 'dark',
    profile: {
      name: '',
      occupation: '',
      workType: 'empleado',
      city: '',
      hasProject: false,
      projectName: '',
      liveWith: 'solo',
      peopleAtHome: 0,
      peopleSupport: 0,
      housing: 'arriendo',
      hasPartner: false,
      hasChildren: false,
      hasPets: false,
      monthlySalary: 0,
      payFrequency: 'mensual',
      hasCommissions: false,
      hasExtraIncome: false,
      invests: false,
      hasSavingGoal: false,
      savingGoalName: '',
      savingGoalAmount: 0,
      savingGoalDate: '',
      hasImpulseSpending: false,
      gamblesFrequently: false,
      strictness: 'normal',
      hasDebts: false,
      debtMonthly: 0,
      hasCreditCard: false
    },
    saldo: 0,
    transactions: [],
    savingGoals: [],
    savingMovements: [],
    investments: [],
    debts: [],
    learnedRules: {},
    economicRef: { ...COLOMBIA, updatedAt: '2026-04-26' }
  };
}

// ---- Estado global de la app ----
let APP = null;
let currentPage = 'dashboard';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let movFilter = 'todos';
let reportPeriod = 'mes';

// ---- LocalStorage ----
function saveData() {
  try {
    localStorage.setItem('sfp_data', JSON.stringify(APP));
  } catch (e) {
    console.warn('Error guardando datos', e);
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem('sfp_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge para no perder nuevos campos
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
  } catch (e) {
    console.warn('Error cargando datos', e);
  }
  return false;
}

function resetApp() {
  // Nota: esto borra datos locales. Los datos en Firebase se borran al guardar vacío.
  if (confirm('¿Seguro que quieres borrar TODOS tus datos? Esta acción no se puede deshacer.')) {
    localStorage.removeItem('sfp_data');
    location.reload();
  }
}

// ---- ID único ----
function genId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// ---- Formato moneda ----
function fmtCOP(val, sign = true) {
  if (val === null || val === undefined || isNaN(val)) return '$0';
  const abs = Math.abs(val);
  const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(abs);
  if (sign && val < 0) return '-' + fmt;
  return fmt;
}

function fmtPct(val, decimals = 2) {
  if (isNaN(val)) return '0%';
  return val.toFixed(decimals) + '%';
}

// ---- Fecha ----
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMonthLabel(m, y) {
  const d = new Date(y, m, 1);
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
}

function getMonthShort(m, y) {
  const d = new Date(y, m, 1);
  return d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ---- Tasa mensual desde EA ----
function tasaMensual(tasaEA) {
  return (Math.pow(1 + tasaEA / 100, 1 / 12) - 1) * 100;
}

// ---- Transacciones del mes ----
function txOfMonth(m, y, type = null) {
  return APP.transactions.filter(tx => {
    const d = new Date(tx.date + 'T12:00:00');
    const match = d.getMonth() === m && d.getFullYear() === y;
    if (!match) return false;
    if (type) return tx.type === type;
    return true;
  });
}

function sumTx(txs) {
  return txs.reduce((s, tx) => s + (tx.amount || 0), 0);
}

// ---- Calcular saldo disponible ----
function calcSaldo() {
  let saldo = 0;
  APP.transactions.forEach(tx => {
    if (tx.type === 'ingreso') saldo += tx.amount;
    else if (tx.type === 'gasto') saldo -= tx.amount;
    else if (tx.type === 'inversion') saldo -= tx.amount;
  });
  APP.savingMovements.forEach(sm => {
    if (sm.direction === 'deposito') saldo -= sm.amount;
    else if (sm.direction === 'retiro') saldo += sm.amount;
  });
  return saldo;
}

// ---- Saldo total de ahorros ----
function calcTotalAhorros() {
  let total = 0;
  APP.savingGoals.forEach(g => total += (g.balance || 0));
  return total;
}

// ---- Deuda total ----
function calcTotalDeuda() {
  return APP.debts.reduce((s, d) => {
    if (!d.paid) s += (d.remainingBalance || d.totalAmount || 0);
    return s;
  }, 0);
}

// ---- Puntuación financiera (0-100) ----
function calcScore() {
  let score = 50;
  const saldo = calcSaldo();
  const ingresos = sumTx(txOfMonth(currentMonth, currentYear, 'ingreso'));
  const gastos = sumTx(txOfMonth(currentMonth, currentYear, 'gasto'));
  const inversiones = sumTx(txOfMonth(currentMonth, currentYear, 'inversion'));
  const deuda = calcTotalDeuda();
  const ahorros = calcTotalAhorros();

  // Saldo positivo
  if (saldo > 0) score += 10;
  if (saldo > ingresos * 0.3) score += 5;

  // Gastos < ingresos
  if (ingresos > 0 && gastos < ingresos) score += 10;
  if (ingresos > 0 && gastos < ingresos * 0.7) score += 5;

  // Ahorro
  if (ahorros > 0) score += 8;
  if (ahorros > ingresos * 0.1) score += 4;

  // Inversión
  if (inversiones > 0) score += 6;

  // Sin deudas
  if (deuda === 0) score += 12;
  else if (deuda < saldo) score += 4;

  // Penalizaciones
  if (gastos > ingresos) score -= 20;
  if (deuda > saldo * 2) score -= 10;
  if (deuda > 0) score = Math.min(score, 85); // con deudas no puede llegar a 100

  // Gastos malos > 30%
  const gastosMalos = txOfMonth(currentMonth, currentYear, 'gasto')
    .filter(tx => ['gastos_malos', 'gusticos', 'entretenimiento', 'azar_gasto'].includes(tx.category))
    .reduce((s, tx) => s + tx.amount, 0);
  if (gastos > 0 && gastosMalos / gastos > 0.3) score -= 10;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getEstado(score, deuda) {
  if (deuda > 0 && score >= 90) score = 85; // con deuda no puede ser excelente perfecta
  if (score >= 85 && deuda === 0) return { label: 'Excelente', cls: 'excelente', icon: 'fa-circle-check' };
  if (score >= 65) return { label: 'Bien', cls: 'bien', icon: 'fa-thumbs-up' };
  if (score >= 40) return { label: 'Mal', cls: 'mal', icon: 'fa-triangle-exclamation' };
  return { label: 'Grave', cls: 'grave', icon: 'fa-circle-xmark' };
}

// ---- Obtener label de categoría ----
function getCategoryLabel(cat) {
  const all = [...TIPOS_INGRESO, ...TIPOS_GASTO, ...TIPOS_INVERSION, ...TIPOS_AHORRO];
  const found = all.find(t => t.id === cat);
  return found ? found.label : cat || 'Sin categoría';
}

function getTypeLabel(type) {
  const map = { ingreso: 'Ingreso', gasto: 'Gasto', inversion: 'Inversión', ahorro: 'Ahorro', deuda: 'Deuda', azar: 'Azar' };
  return map[type] || type;
}

// ---- Icon para tipo de ingreso/gasto ----
function getCategoryIcon(cat) {
  const all = [...TIPOS_INGRESO, ...TIPOS_GASTO, ...TIPOS_INVERSION, ...TIPOS_AHORRO, ...TIPOS_DEUDA];
  const found = all.find(t => t.id === cat);
  return found ? found.icon : 'fa-circle';
}
