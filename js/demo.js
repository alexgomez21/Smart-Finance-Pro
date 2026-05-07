/* =============================================
   DEMO.JS - Datos de muestra para primera visita
   (solo se carga si no hay datos previos)
   ============================================= */

function loadDemoData() {
  // Solo cargar demo si no hay transacciones
  if (APP.transactions.length > 0) return;

  const today = todayStr();
  const thisMonth = today.substr(0, 7);
  const lastMonth = (() => {
    let d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().substr(0, 7);
  })();

  // ---- Transacciones del mes actual ----
  APP.transactions.push(
    { id: genId(), type: 'ingreso', category: 'salario', amount: 2400000, date: `${thisMonth}-01`, description: 'Salario mayo', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 25 },
    { id: genId(), type: 'ingreso', category: 'extras_comisiones', amount: 350000, date: `${thisMonth}-05`, description: 'Comisión venta', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 21 },
    { id: genId(), type: 'gasto', category: 'hogar', amount: 650000, date: `${thisMonth}-02`, description: 'Arriendo', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 24 },
    { id: genId(), type: 'gasto', category: 'alimentacion', amount: 280000, date: `${thisMonth}-08`, description: 'Mercado semanal', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 18 },
    { id: genId(), type: 'gasto', category: 'servicios', amount: 95000, date: `${thisMonth}-10`, description: 'Internet + Netflix', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 16 },
    { id: genId(), type: 'gasto', category: 'transporte', amount: 120000, date: `${thisMonth}-12`, description: 'Pasajes semana', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 14 },
    { id: genId(), type: 'gasto', category: 'alimentacion', amount: 15000, date: `${thisMonth}-14`, description: 'Almuerzo', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 12 },
    { id: genId(), type: 'gasto', category: 'gusticos', amount: 8500, date: `${thisMonth}-15`, description: 'Salchipapa', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 11 },
    { id: genId(), type: 'gasto', category: 'alimentacion', amount: 1000, date: `${thisMonth}-16`, description: 'Agua', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 10 },
    { id: genId(), type: 'gasto', category: 'entretenimiento', amount: 45000, date: `${thisMonth}-18`, description: 'Cine con pareja', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 8 },
    { id: genId(), type: 'gasto', category: 'salud', amount: 35000, date: `${thisMonth}-20`, description: 'Copago médico', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 6 },
    { id: genId(), type: 'gasto', category: 'alimentacion', amount: 260000, date: `${thisMonth}-22`, description: 'Mercado Ara', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 4 },
    { id: genId(), type: 'inversion', category: 'cdt_inv', amount: 300000, date: `${thisMonth}-01`, description: 'Bolsillo alto rendimiento Nequi', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 25 },
    { id: genId(), type: 'gasto', category: 'gastos_malos', amount: 50000, date: `${thisMonth}-21`, description: 'Cerveza con amigos', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 5 },
    { id: genId(), type: 'gasto', category: 'azar_gasto', amount: 10000, date: `${thisMonth}-19`, description: 'Chance', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 7 }
  );

  // ---- Mes anterior (para comparativas) ----
  APP.transactions.push(
    { id: genId(), type: 'ingreso', category: 'salario', amount: 2400000, date: `${lastMonth}-01`, description: 'Salario abril', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 50 },
    { id: genId(), type: 'gasto', category: 'hogar', amount: 650000, date: `${lastMonth}-02`, description: 'Arriendo', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 49 },
    { id: genId(), type: 'gasto', category: 'alimentacion', amount: 310000, date: `${lastMonth}-08`, description: 'Mercado', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 43 },
    { id: genId(), type: 'gasto', category: 'servicios', amount: 95000, date: `${lastMonth}-10`, description: 'Servicios', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 41 },
    { id: genId(), type: 'gasto', category: 'transporte', amount: 130000, date: `${lastMonth}-15`, description: 'Pasajes', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 36 },
    { id: genId(), type: 'gasto', category: 'entretenimiento', amount: 80000, date: `${lastMonth}-20`, description: 'Concierto', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 31 },
    { id: genId(), type: 'ingreso', category: 'venta', amount: 200000, date: `${lastMonth}-25`, description: 'Venta ropa vieja', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 26 },
    { id: genId(), type: 'gasto', category: 'azar_gasto', amount: 20000, date: `${lastMonth}-22`, description: 'Lotería', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 29 }
  );

  // ---- Meta de ahorro ----
  const goalId = genId();
  APP.savingGoals.push({
    id: goalId,
    name: 'Fondo de emergencia',
    type: 'emergencia',
    targetAmount: 3000000,
    targetDate: '',
    balance: 450000,
    priority: 'alta',
    createdAt: Date.now() - 86400000 * 60
  });

  APP.savingMovements.push(
    { id: genId(), goalId, goalName: 'Fondo de emergencia', direction: 'deposito', amount: 200000, date: `${lastMonth}-15`, notes: 'Ahorro mensual', source: 'saldo', createdAt: Date.now() - 86400000 * 36 },
    { id: genId(), goalId, goalName: 'Fondo de emergencia', direction: 'deposito', amount: 250000, date: `${thisMonth}-05`, notes: 'Ahorro mayo', source: 'saldo', createdAt: Date.now() - 86400000 * 21 }
  );

  // ---- Inversión ----
  APP.investments.push({
    id: genId(),
    type: 'cdt_inv',
    name: 'Bolsillo Nequi alto rendimiento',
    businessName: '',
    initialAmount: 300000,
    currentValue: 302500,
    date: `${thisMonth}-01`,
    notes: 'Tasa 11% E.A.',
    movements: [],
    active: true,
    createdAt: Date.now() - 86400000 * 25
  });

  // ---- Deuda de demo ----
  APP.debts.push({
    id: genId(),
    type: 'tarjeta',
    name: 'Tarjeta crédito banco X',
    purpose: 'Compra celular',
    requestedAmount: 1500000,
    totalAmount: 1500000,
    monthlyInterest: 1.9,
    termMonths: 12,
    monthlyPayment: 138862,
    remainingBalance: 1200000,
    creditor: 'Banco X',
    startDate: `${lastMonth}-01`,
    paid: false,
    payments: [
      { id: genId(), date: `${lastMonth}-15`, amount: 138862, interest: 28500, capital: 110362, source: 'saldo', notes: '' }
    ],
    annualInterest: 25.34,
    riskLevel: 'warn',
    notes: '',
    createdAt: Date.now() - 86400000 * 45
  });

  // ---- Ingreso de azar ----
  APP.transactions.push(
    { id: genId(), type: 'ingreso', category: 'azar', amount: 5000, date: `${thisMonth}-17`, description: 'Gané chance', source: 'saldo', autoCategorized: true, createdAt: Date.now() - 86400000 * 9 }
  );

  saveData();
}
