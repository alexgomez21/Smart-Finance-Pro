/* =============================================
   ENGINE.JS - Lógica de negocio y operaciones
   Smart Finance Personal
   ============================================= */

'use strict';

// =============================================
// TRANSACCIONES
// =============================================

function addTransaction(txData) {
  // txData: { type, category, amount, date, description, source, notes, subtype, businessName }
  const tx = {
    id: genId(),
    type: txData.type,
    category: txData.category || 'no_det_gasto',
    amount: parseFloat(txData.amount) || 0,
    date: txData.date || todayStr(),
    description: txData.description || '',
    source: txData.source || 'saldo',
    notes: txData.notes || '',
    subtype: txData.subtype || '',
    businessName: txData.businessName || '',
    autoCategorized: txData.autoCategorized || false,
    userCorrected: false,
    createdAt: Date.now()
  };

  // Si es ingreso de préstamo → también crear deuda
  if (tx.type === 'ingreso' && tx.category === 'prestamo_recibido') {
    APP.saldo += tx.amount;
    APP.transactions.push(tx);
    saveDataCloud();
    return { tx, needsDebt: true };
  }

  APP.transactions.push(tx);
  saveDataCloud();
  return { tx };
}

function editTransaction(id, newData) {
  const idx = APP.transactions.findIndex(t => t.id === id);
  if (idx === -1) return false;
  APP.transactions[idx] = { ...APP.transactions[idx], ...newData, updatedAt: Date.now() };
  saveDataCloud();
  return true;
}

function deleteTransaction(id) {
  APP.transactions = APP.transactions.filter(t => t.id !== id);
  saveDataCloud();
}

function updateTransactionCategory(id, newCategory) {
  const idx = APP.transactions.findIndex(t => t.id === id);
  if (idx === -1) return;
  const tx = APP.transactions[idx];
  tx.category = newCategory;
  tx.userCorrected = true;
  // Aprender esta regla
  if (tx.description) {
    learnRule(tx.description, newCategory);
  }
  APP.transactions[idx] = tx;
  saveDataCloud();
}

// =============================================
// AHORROS
// =============================================

function addSavingGoal(goalData) {
  const goal = {
    id: genId(),
    name: goalData.name || 'Meta',
    type: goalData.type || 'otro_ahorro',
    targetAmount: parseFloat(goalData.targetAmount) || 0,
    targetDate: goalData.targetDate || '',
    balance: 0,
    priority: goalData.priority || 'media',
    createdAt: Date.now()
  };
  APP.savingGoals.push(goal);
  saveDataCloud();
  return goal;
}

function addSavingMovement(movData) {
  // movData: { goalId, direction: 'deposito'|'retiro', amount, date, notes }
  const goal = APP.savingGoals.find(g => g.id === movData.goalId);
  if (!goal) return null;

  const amount = parseFloat(movData.amount) || 0;
  if (movData.direction === 'deposito') {
    goal.balance = (goal.balance || 0) + amount;
  } else {
    goal.balance = Math.max(0, (goal.balance || 0) - amount);
  }

  const mov = {
    id: genId(),
    goalId: movData.goalId,
    goalName: goal.name,
    direction: movData.direction,
    amount,
    date: movData.date || todayStr(),
    notes: movData.notes || '',
    source: movData.source || 'saldo',
    createdAt: Date.now()
  };
  APP.savingMovements.push(mov);
  saveDataCloud();
  return mov;
}

function deleteSavingGoal(id) {
  APP.savingGoals = APP.savingGoals.filter(g => g.id !== id);
  APP.savingMovements = APP.savingMovements.filter(m => m.goalId !== id);
  saveDataCloud();
}

function calcGoalProgress(goal) {
  const bal = goal.balance || 0;
  const tgt = goal.targetAmount || 0;
  const pct = tgt > 0 ? Math.min(100, (bal / tgt) * 100) : 0;
  return { bal, tgt, pct };
}

function calcGoalETA(goal) {
  const movs = APP.savingMovements.filter(m => m.goalId === goal.id && m.direction === 'deposito');
  if (movs.length === 0) return null;
  const sorted = movs.sort((a, b) => a.date.localeCompare(b.date));
  const oldest = sorted[0].date;
  const daysSinceFirst = Math.max(1, (Date.now() - new Date(oldest + 'T12:00:00').getTime()) / 86400000);
  const totalDeposited = movs.reduce((s, m) => s + m.amount, 0);
  const dailyRate = totalDeposited / daysSinceFirst;
  if (dailyRate <= 0) return null;
  const missing = (goal.targetAmount || 0) - (goal.balance || 0);
  if (missing <= 0) return { done: true };
  const daysLeft = Math.ceil(missing / dailyRate);
  const monthsLeft = Math.ceil(daysLeft / 30);
  return { daysLeft, monthsLeft, dailyRate, monthlyRate: dailyRate * 30 };
}

// =============================================
// INVERSIONES
// =============================================

function addInvestment(invData) {
  const inv = {
    id: genId(),
    type: invData.type || 'otro_inv',
    name: invData.name || 'Inversión',
    businessName: invData.businessName || '',
    initialAmount: parseFloat(invData.initialAmount) || 0,
    currentValue: parseFloat(invData.initialAmount) || 0,
    date: invData.date || todayStr(),
    notes: invData.notes || '',
    movements: [],
    active: true,
    createdAt: Date.now()
  };
  APP.investments.push(inv);
  // Registrar como transacción de tipo inversión
  addTransaction({
    type: 'inversion',
    category: invData.type,
    amount: inv.initialAmount,
    date: inv.date,
    description: inv.name,
    source: 'saldo',
    autoCategorized: true
  });
  saveDataCloud();
  return inv;
}

function addInvestmentMovement(invId, movData) {
  const inv = APP.investments.find(i => i.id === invId);
  if (!inv) return null;
  const amount = parseFloat(movData.amount) || 0;
  const mov = { id: genId(), direction: movData.direction, amount, date: movData.date || todayStr(), notes: movData.notes || '' };
  if (!inv.movements) inv.movements = [];
  inv.movements.push(mov);
  if (movData.direction === 'aporte') inv.currentValue = (inv.currentValue || 0) + amount;
  else if (movData.direction === 'retiro') inv.currentValue = Math.max(0, (inv.currentValue || 0) - amount);
  else if (movData.direction === 'rendimiento') inv.currentValue = (inv.currentValue || 0) + amount;
  saveDataCloud();
  return mov;
}

function calcInvROI(inv) {
  const total = (inv.currentValue || 0);
  const init = (inv.initialAmount || 0);
  if (init === 0) return 0;
  return ((total - init) / init) * 100;
}

function deleteInvestment(id) {
  APP.investments = APP.investments.filter(i => i.id !== id);
  saveDataCloud();
}

// =============================================
// DEUDAS
// =============================================

function addDebt(debtData) {
  const totalAmount = parseFloat(debtData.totalAmount) || 0;
  const monthlyInterest = parseFloat(debtData.monthlyInterest) || 0;
  const termMonths = parseInt(debtData.termMonths) || 1;
  // Calcular cuota aproximada si no está dada
  let monthlyPayment = parseFloat(debtData.monthlyPayment) || 0;
  if (monthlyPayment === 0 && monthlyInterest > 0) {
    const r = monthlyInterest / 100;
    monthlyPayment = totalAmount * r * Math.pow(1 + r, termMonths) / (Math.pow(1 + r, termMonths) - 1);
  } else if (monthlyPayment === 0) {
    monthlyPayment = totalAmount / termMonths;
  }

  const debt = {
    id: genId(),
    type: debtData.type || 'otro_deuda',
    name: debtData.name || 'Deuda',
    purpose: debtData.purpose || '',
    requestedAmount: parseFloat(debtData.requestedAmount) || totalAmount,
    totalAmount,
    monthlyInterest,
    termMonths,
    monthlyPayment,
    remainingBalance: totalAmount,
    creditor: debtData.creditor || '',
    startDate: debtData.startDate || todayStr(),
    paid: false,
    payments: [],
    notes: debtData.notes || '',
    createdAt: Date.now()
  };

  // Análisis automático de usura
  const annualEquivalent = (Math.pow(1 + monthlyInterest / 100, 12) - 1) * 100;
  debt.annualInterest = annualEquivalent;
  if (annualEquivalent > COLOMBIA.tasaUsura) debt.riskLevel = 'danger';
  else if (annualEquivalent > COLOMBIA.interesBC * 1.2) debt.riskLevel = 'warn';
  else debt.riskLevel = 'ok';

  APP.debts.push(debt);
  saveDataCloud();
  return debt;
}

function payDebt(debtId, paymentData) {
  const debt = APP.debts.find(d => d.id === debtId);
  if (!debt) return null;
  const amount = parseFloat(paymentData.amount) || 0;
  const interestPart = parseFloat(paymentData.interest) || (debt.remainingBalance * debt.monthlyInterest / 100);
  const capitalPart = amount - interestPart;
  const payment = {
    id: genId(),
    date: paymentData.date || todayStr(),
    amount,
    interest: Math.max(0, interestPart),
    capital: Math.max(0, capitalPart),
    source: paymentData.source || 'saldo',
    notes: paymentData.notes || ''
  };
  debt.remainingBalance = Math.max(0, debt.remainingBalance - Math.max(0, capitalPart));
  if (!debt.payments) debt.payments = [];
  debt.payments.push(payment);
  if (debt.remainingBalance <= 0) debt.paid = true;
  saveDataCloud();
  return payment;
}

function deleteDebt(id) {
  APP.debts = APP.debts.filter(d => d.id !== id);
  saveDataCloud();
}

function getDebtAdvice(debt) {
  const annual = debt.annualInterest || 0;
  if (debt.riskLevel === 'danger') {
    return `⚠️ ALERTA: La tasa de esta deuda (${fmtPct(annual)} E.A.) supera la tasa de usura legal (${fmtPct(COLOMBIA.tasaUsura)} E.A.). Esto podría ser ilegal. Consulta a un abogado o la Superfinanciera.`;
  }
  if (debt.riskLevel === 'warn') {
    return `Esta deuda tiene una tasa alta (${fmtPct(annual)} E.A.) comparada con el interés bancario corriente (${fmtPct(COLOMBIA.interesBC)} E.A.). Considera prepagar o renegociar si puedes.`;
  }
  if (annual === 0) return 'Deuda sin interés. Intenta pagarla pronto para liberar flujo.';
  return `Tasa razonable (${fmtPct(annual)} E.A.). Igual, recuerda: mejor dueño de un peso que esclavo de dos.`;
}

// =============================================
// SALDO: VERIFICACIÓN Y DEDUCCIÓN
// =============================================

function getCurrentSaldo() {
  return calcSaldo();
}

function canAfford(amount) {
  return getCurrentSaldo() >= amount;
}

// =============================================
// EXPORTAR / IMPORTAR JSON
// =============================================

function exportarJSON() {
  const data = {
    ...APP,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart-finance-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('✅ Datos exportados correctamente', 'success');
}

function importarJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed.transactions && !parsed.profile) throw new Error('Formato inválido');
      APP = Object.assign(getDefaultData(), parsed);
      saveDataCloud();
      showToast('✅ Datos importados correctamente', 'success');
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      showToast('❌ Error al importar: archivo inválido', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// =============================================
// ANÁLISIS INTELIGENTE
// =============================================

function generateAlerts() {
  const alerts = [];
  const saldo = getCurrentSaldo();
  const ingresos = sumTx(txOfMonth(currentMonth, currentYear, 'ingreso'));
  const gastos = sumTx(txOfMonth(currentMonth, currentYear, 'gasto'));
  const inversiones = sumTx(txOfMonth(currentMonth, currentYear, 'inversion'));
  const deuda = calcTotalDeuda();
  const ahorros = calcTotalAhorros();

  // Saldo negativo
  if (saldo < 0) {
    alerts.push({ type: 'danger', icon: 'fa-circle-xmark', text: `Tu saldo disponible es negativo (${fmtCOP(saldo)}). Revisa de dónde salió el dinero de tus gastos.` });
  }

  // Gastos > ingresos
  if (ingresos > 0 && gastos > ingresos) {
    alerts.push({ type: 'danger', icon: 'fa-arrow-trend-down', text: `Este mes gastaste más de lo que ingresaste. Gastos: ${fmtCOP(gastos)} — Ingresos: ${fmtCOP(ingresos)}. Revisa tus hábitos.` });
  }

  // Gastos de riesgo > 30%
  const gastosMalos = txOfMonth(currentMonth, currentYear, 'gasto')
    .filter(tx => ['gastos_malos', 'gusticos', 'entretenimiento', 'azar_gasto'].includes(tx.category))
    .reduce((s, tx) => s + tx.amount, 0);
  if (gastos > 0 && gastosMalos / gastos > 0.3) {
    alerts.push({ type: 'warning', icon: 'fa-triangle-exclamation', text: `Tus gusticos, entretenimiento y gastos de riesgo superan el 30% de tus gastos. Son ${fmtCOP(gastosMalos)} de ${fmtCOP(gastos)} totales.` });
  }

  // Comparar salario con mínimo
  if (APP.profile.monthlySalary > 0 && APP.profile.monthlySalary < COLOMBIA.salarioMinimo) {
    alerts.push({ type: 'warning', icon: 'fa-scale-balanced', text: `Tu salario declarado (${fmtCOP(APP.profile.monthlySalary)}) está por debajo del salario mínimo de ${fmtCOP(COLOMBIA.salarioMinimo)}. Esto puede generar presión financiera.` });
  }

  // Inversiones vs inflación
  if (APP.investments.length > 0) {
    const totalInv = APP.investments.reduce((s, i) => s + (i.initialAmount || 0), 0);
    const totalVal = APP.investments.reduce((s, i) => s + (i.currentValue || 0), 0);
    if (totalInv > 0) {
      const roi = ((totalVal - totalInv) / totalInv) * 100;
      if (roi < COLOMBIA.inflacionAnual / 12) {
        alerts.push({ type: 'info', icon: 'fa-chart-line', text: `Tus inversiones están rindiendo por debajo de la inflación mensual (${fmtPct(COLOMBIA.inflacionMensual)}). Evalúa alternativas como CDT al ${fmtPct(COLOMBIA.mejorCDT)} E.A.` });
      } else {
        alerts.push({ type: 'success', icon: 'fa-thumbs-up', text: `Tus inversiones están superando la inflación. ¡Buen trabajo!` });
      }
    }
  }

  // Deudas a tasa usura
  APP.debts.filter(d => !d.paid && d.riskLevel === 'danger').forEach(d => {
    alerts.push({ type: 'danger', icon: 'fa-triangle-exclamation', text: `La deuda "${d.name}" supera la tasa de usura (${fmtPct(COLOMBIA.tasaUsura)} E.A.). Tasa actual: ${fmtPct(d.annualInterest || 0)} E.A. Busca alternativas urgentes.` });
  });

  // Sin ahorro
  if (ahorros === 0 && ingresos > 0) {
    alerts.push({ type: 'info', icon: 'fa-piggy-bank', text: `No tienes ahorros registrados. Empieza aunque sea con un pequeño fondo de emergencia.` });
  }

  // Salario mínimo comparación
  if (ingresos > 0 && ingresos < COLOMBIA.salarioMinimo * 0.5) {
    alerts.push({ type: 'warning', icon: 'fa-coins', text: `Tus ingresos de este mes (${fmtCOP(ingresos)}) son muy bajos. Considera buscar fuentes adicionales de ingreso.` });
  }

  if (alerts.length === 0) {
    alerts.push({ type: 'success', icon: 'fa-circle-check', text: '¡Todo parece bien este mes! Sigue así y mantén la disciplina.' });
  }

  return alerts;
}

function generateAnalysis(period) {
  const texts = [];
  const saldo = getCurrentSaldo();
  const ingresos = sumTx(txOfMonth(currentMonth, currentYear, 'ingreso'));
  const gastos = sumTx(txOfMonth(currentMonth, currentYear, 'gasto'));
  const deuda = calcTotalDeuda();
  const ahorros = calcTotalAhorros();
  const score = calcScore();
  const estado = getEstado(score, deuda);

  texts.push(`<strong>Estado general:</strong> <span class="analysis-tag ${estado.cls === 'excelente' ? 'green' : estado.cls === 'bien' ? 'blue' : estado.cls === 'mal' ? 'yellow' : 'red'}">${estado.label}</span> — Puntuación financiera: ${score}/100`);

  if (ingresos > 0) {
    const ratio = (gastos / ingresos * 100).toFixed(1);
    texts.push(`Gastaste el <strong>${ratio}%</strong> de tus ingresos este mes. ${ratio > 80 ? 'Estás muy cerca del límite — cuidado.' : ratio > 100 ? '¡Gastas más de lo que ganas!' : 'Vas bien en este aspecto.'}`);
  }

  if (deuda > 0) {
    texts.push(`Tienes <strong>${fmtCOP(deuda)}</strong> en deudas activas. ${deuda > saldo ? 'Tu deuda supera tu saldo disponible — prioriza pagarla.' : 'Tu saldo puede cubrir la deuda, pero conviene liquidarla pronto.'}`);
  }

  if (ahorros > 0) {
    texts.push(`Tienes <strong>${fmtCOP(ahorros)}</strong> acumulados en ahorros. ¡Bien! Sigue construyendo ese colchón.`);
  }

  // Consejo personalizado
  if (APP.profile.hasImpulseSpending) {
    texts.push(`Sabes que te cuesta controlar los gastos de impulso. Revisa si esta semana cediste a algún antojo innecesario.`);
  }
  if (APP.profile.gamblesFrequently) {
    texts.push(`Juegas con frecuencia. Revisa el módulo de <strong>Juegos de Azar</strong> para ver si tus apuestas están siendo rentables o te están costando.`);
  }

  const bestCDT = COLOMBIA.mejorCDT;
  if (saldo > 1000000) {
    texts.push(`Tienes ${fmtCOP(saldo)} en saldo disponible. Los mejores CDT en Colombia están pagando hasta <strong>${fmtPct(bestCDT)} E.A.</strong> — ¿Vale la pena dejar esa plata quieta?`);
  }

  return texts.map(t => `<p>${t}</p>`).join('');
}

function generateGamblingAdvice() {
  const azarGastos = APP.transactions.filter(tx => tx.type === 'gasto' && tx.category === 'azar_gasto');
  const azarGanancias = APP.transactions.filter(tx => tx.type === 'ingreso' && tx.category === 'azar');
  const totalGastado = azarGastos.reduce((s, tx) => s + tx.amount, 0);
  const totalGanado = azarGanancias.reduce((s, tx) => s + tx.amount, 0);
  const balance = totalGanado - totalGastado;

  let advice = '';
  if (totalGastado === 0 && totalGanado === 0) {
    advice = 'No tienes movimientos de juegos de azar registrados.';
  } else if (balance < 0) {
    const pct = totalGastado > 0 ? Math.abs(balance / totalGastado * 100).toFixed(1) : 0;
    advice = `Has perdido ${fmtCOP(Math.abs(balance))} en total en juegos de azar (${pct}% de lo que has apostado). La probabilidad matemática siempre favorece a la casa. Considera reducir o eliminar este gasto.`;
  } else if (balance > 0) {
    advice = `Has tenido una racha positiva (ganancia neta de ${fmtCOP(balance)}), pero recuerda: los juegos de azar no son una fuente confiable de ingresos. Lo que hoy ganaste puedes perderlo mañana.`;
  } else {
    advice = 'Tu balance en juegos de azar está en cero. Ni ganaste ni perdiste, pero cada apuesta es un riesgo.';
  }
  return advice;
}

// =============================================
// COMPARACIÓN VS INDICADORES COLOMBIA
// =============================================

function generateComparisons() {
  const comparisons = [];
  const ingresos = sumTx(txOfMonth(currentMonth, currentYear, 'ingreso'));
  const deuda = calcTotalDeuda();
  const ahorros = calcTotalAhorros();

  // Salario vs mínimo
  const salario = APP.profile.monthlySalary || ingresos;
  if (salario > 0) {
    const vsMin = salario >= COLOMBIA.salarioMinimo;
    comparisons.push({
      icon: vsMin ? '💼' : '⚠️',
      text: `Tu ingreso mensual (${fmtCOP(salario)}) vs Salario mínimo (${fmtCOP(COLOMBIA.salarioMinimo)})`,
      status: vsMin ? 'ok' : 'warn',
      label: vsMin ? 'Por encima' : 'Por debajo'
    });
  }

  // Inflación vs rendimiento de inversiones
  if (APP.investments.length > 0) {
    const totalInv = APP.investments.reduce((s, i) => s + (i.initialAmount || 0), 0);
    const totalVal = APP.investments.reduce((s, i) => s + (i.currentValue || 0), 0);
    if (totalInv > 0) {
      const roi = ((totalVal - totalInv) / totalInv) * 100;
      const vence = roi > COLOMBIA.inflacionAnual;
      comparisons.push({
        icon: vence ? '📈' : '📉',
        text: `Rendimiento de inversiones (${fmtPct(roi)}) vs Inflación anual (${fmtPct(COLOMBIA.inflacionAnual)})`,
        status: vence ? 'ok' : 'warn',
        label: vence ? 'Supera inflación' : 'Por debajo inflación'
      });
    }
  }

  // Deudas vs tasa usura
  if (deuda > 0) {
    const deudaMasAlta = APP.debts.filter(d => !d.paid).reduce((max, d) => d.annualInterest > max ? d.annualInterest : max, 0);
    const bienDeuda = deudaMasAlta <= COLOMBIA.tasaUsura;
    comparisons.push({
      icon: bienDeuda ? '💳' : '🚨',
      text: `Tu tasa de deuda más alta (${fmtPct(deudaMasAlta)} E.A.) vs Tasa de usura (${fmtPct(COLOMBIA.tasaUsura)} E.A.)`,
      status: bienDeuda ? (deudaMasAlta < COLOMBIA.interesBC ? 'ok' : 'warn') : 'bad',
      label: bienDeuda ? 'Dentro del límite' : 'Supera usura'
    });
  }

  // Ahorros vs CDT
  if (ahorros > 0) {
    comparisons.push({
      icon: '🏦',
      text: `Tienes ${fmtCOP(ahorros)} en ahorros. Los mejores CDT pagan hasta ${fmtPct(COLOMBIA.mejorCDT)} E.A. ¿Vale la pena explorar esta opción?`,
      status: 'ok',
      label: 'Info'
    });
  }

  return comparisons;
}
