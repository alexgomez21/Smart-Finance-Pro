/* =============================================
   APP.JS - Inicialización y render de páginas
   Smart Finance Personal
   ============================================= */

'use strict';

// =============================================
// INICIALIZACIÓN
// =============================================

window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  overlay.className = 'sidebar-overlay';
  overlay.onclick = toggleSidebar;
  document.body.appendChild(overlay);
});

function showOnboarding() {
  if (!APP) APP = getDefaultData();
  document.getElementById('onboarding-modal').classList.remove('hidden');
  setupOnboardingListeners();
}

function startApp() {
  // Cargar datos demo si la app está vacía
  loadDemoData();

  // Aplicar tema guardado
  const body = document.getElementById('app-body');
  body.className = APP.theme === 'light' ? 'light-theme' : 'dark-theme';

  const iconEl = document.getElementById('theme-icon');
  const iconMob = document.getElementById('theme-icon-mobile');
  const label = document.getElementById('theme-label');
  if (APP.theme === 'light') {
    if (iconEl) iconEl.className = 'fas fa-sun';
    if (iconMob) iconMob.className = 'fas fa-sun';
    if (label) label.textContent = 'Tema oscuro';
  }

  document.getElementById('main-app').classList.remove('hidden');
  updateNavUser();
  navTo('dashboard');
}

// =============================================
// ONBOARDING
// =============================================

let obCurrentStep = 1;
const OB_TOTAL = 5;

function setupOnboardingListeners() {
  // Proyecto toggle
  document.querySelectorAll('input[name="ob-project"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('ob-project-name-group').classList.toggle('hidden', r.value === 'no' || !r.checked);
    });
  });
  // Ahorro para algo
  document.querySelectorAll('input[name="ob-saving-goal"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('ob-goal-details').classList.toggle('hidden', r.value === 'no' || !r.checked);
    });
  });
  // Deudas
  document.querySelectorAll('input[name="ob-has-debts"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('ob-debt-info').classList.toggle('hidden', r.value === 'no' || !r.checked);
    });
  });
}

function obNext() {
  if (!validateObStep(obCurrentStep)) return;
  saveObStep(obCurrentStep);

  if (obCurrentStep < OB_TOTAL) {
    document.getElementById(`ob-step-${obCurrentStep}`).classList.add('hidden');
    obCurrentStep++;
    document.getElementById(`ob-step-${obCurrentStep}`).classList.remove('hidden');

    // Update steps UI
    document.querySelectorAll('.step').forEach((s, i) => {
      const n = i + 1;
      s.classList.remove('active', 'done');
      if (n < obCurrentStep) s.classList.add('done');
      else if (n === obCurrentStep) s.classList.add('active');
    });

    document.getElementById('ob-back').style.display = 'block';
    if (obCurrentStep === OB_TOTAL) {
      document.getElementById('ob-next').innerHTML = '<i class="fas fa-rocket"></i> Comenzar';
    }
  } else {
    // Finalizar onboarding
    saveObStep(OB_TOTAL);
    saveDataCloud();
    document.getElementById('onboarding-modal').classList.add('hidden');
    startApp();
  }
}

function obBack() {
  if (obCurrentStep <= 1) return;
  document.getElementById(`ob-step-${obCurrentStep}`).classList.add('hidden');
  obCurrentStep--;
  document.getElementById(`ob-step-${obCurrentStep}`).classList.remove('hidden');

  document.querySelectorAll('.step').forEach((s, i) => {
    const n = i + 1;
    s.classList.remove('active', 'done');
    if (n < obCurrentStep) s.classList.add('done');
    else if (n === obCurrentStep) s.classList.add('active');
  });

  if (obCurrentStep === 1) document.getElementById('ob-back').style.display = 'none';
  document.getElementById('ob-next').innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
}

function validateObStep(step) {
  if (step === 1) {
    const name = document.getElementById('ob-name')?.value?.trim();
    if (!name) { showToast('Por favor ingresa tu nombre', 'error'); return false; }
  }
  return true;
}

function saveObStep(step) {
  if (!APP) APP = getDefaultData();
  if (step === 1) {
    APP.profile.name = document.getElementById('ob-name')?.value?.trim() || '';
    APP.profile.occupation = document.getElementById('ob-occupation')?.value?.trim() || '';
    APP.profile.workType = document.getElementById('ob-work-type')?.value || 'empleado';
    APP.profile.city = document.getElementById('ob-city')?.value?.trim() || '';
    APP.profile.hasProject = document.querySelector('input[name="ob-project"]:checked')?.value === 'si';
    APP.profile.projectName = document.getElementById('ob-project-name')?.value?.trim() || '';
  }
  if (step === 2) {
    APP.profile.liveWith = document.getElementById('ob-live-with')?.value || 'solo';
    APP.profile.peopleAtHome = parseInt(document.getElementById('ob-people-home')?.value) || 0;
    APP.profile.peopleSupport = parseInt(document.getElementById('ob-people-support')?.value) || 0;
    APP.profile.housing = document.getElementById('ob-housing')?.value || 'arriendo';
    APP.profile.hasPartner = document.querySelector('input[name="ob-partner"]:checked')?.value === 'si';
    APP.profile.hasChildren = document.querySelector('input[name="ob-children"]:checked')?.value === 'si';
    APP.profile.hasPets = document.querySelector('input[name="ob-pets"]:checked')?.value === 'si';
  }
  if (step === 3) {
    APP.profile.monthlySalary = parseFloat(document.getElementById('ob-salary')?.value) || 0;
    APP.profile.payFrequency = document.getElementById('ob-pay-freq')?.value || 'mensual';
    APP.profile.hasCommissions = document.querySelector('input[name="ob-commissions"]:checked')?.value === 'si';
    APP.profile.hasExtraIncome = document.querySelector('input[name="ob-extra-income"]:checked')?.value === 'si';
    APP.profile.invests = document.querySelector('input[name="ob-invests"]:checked')?.value === 'si';
  }
  if (step === 4) {
    APP.profile.hasSavingGoal = document.querySelector('input[name="ob-saving-goal"]:checked')?.value === 'si';
    APP.profile.savingGoalName = document.getElementById('ob-goal-name')?.value?.trim() || '';
    APP.profile.savingGoalAmount = parseFloat(document.getElementById('ob-goal-amount')?.value) || 0;
    APP.profile.savingGoalDate = document.getElementById('ob-goal-date')?.value || '';
    APP.profile.hasImpulseSpending = document.querySelector('input[name="ob-impulse"]:checked')?.value === 'si';
    APP.profile.gamblesFrequently = document.querySelector('input[name="ob-gambling"]:checked')?.value === 'si';
    APP.profile.strictness = document.getElementById('ob-strictness')?.value || 'normal';

    // Crear meta de ahorro si hay
    if (APP.profile.hasSavingGoal && APP.profile.savingGoalName) {
      addSavingGoal({
        name: APP.profile.savingGoalName,
        type: 'otro_ahorro',
        targetAmount: APP.profile.savingGoalAmount,
        targetDate: APP.profile.savingGoalDate,
        priority: 'alta'
      });
    }
  }
  if (step === 5) {
    APP.profile.hasDebts = document.querySelector('input[name="ob-has-debts"]:checked')?.value === 'si';
    APP.profile.debtMonthly = parseFloat(document.getElementById('ob-debt-monthly')?.value) || 0;
    APP.profile.hasCreditCard = document.querySelector('input[name="ob-credit-card"]:checked')?.value === 'si';

    // Si tiene salario, crear primer ingreso
    if (APP.profile.monthlySalary > 0) {
      addTransaction({
        type: 'ingreso',
        category: 'salario',
        amount: APP.profile.monthlySalary,
        date: todayStr(),
        description: 'Salario inicial',
        autoCategorized: true
      });
    }
  }
}

// =============================================
// UPDATE NAV USER
// =============================================

function updateNavUser() {
  const nameEl = document.getElementById('nav-user-name');
  const occEl = document.getElementById('nav-user-occ');
  if (nameEl) nameEl.textContent = APP.profile.name || 'Usuario';
  if (occEl) occEl.textContent = APP.profile.occupation || APP.profile.workType || '—';
  const navAvatar = document.getElementById('nav-user-avatar');
  if (navAvatar) {
    const photoURL = APP.profile.photoURL || (typeof getCurrentUser==='function' && getCurrentUser() ? getCurrentUser().photoURL : null);
    navAvatar.innerHTML = photoURL
      ? `<img src="${photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
      : `<i class="fas fa-user-circle" style="font-size:2rem;color:var(--accent)"></i>`;
  }
}

// =============================================
// REFRESH ALL
// =============================================

function refreshAll() {
  renderPage(currentPage);
}

function renderPage(page) {
  if (page === 'dashboard') renderDashboard();
  else if (page === 'movimientos') renderMovimientos();
  else if (page === 'ingresos') renderIngresos();
  else if (page === 'gastos') renderGastos();
  else if (page === 'inversiones') renderInversiones();
  else if (page === 'ahorros') renderAhorros();
  else if (page === 'deudas') renderDeudas();
  else if (page === 'reportes') renderReportes();
  else if (page === 'azar') renderAzar();
  else if (page === 'perfil') renderPerfil();
}

// =============================================
// DASHBOARD
// =============================================

function renderDashboard() {
  const ingresos = sumTx(txOfMonth(currentMonth, currentYear, 'ingreso'));
  const gastos = sumTx(txOfMonth(currentMonth, currentYear, 'gasto'));
  const inversiones = sumTx(txOfMonth(currentMonth, currentYear, 'inversion'));
  const saldo = getCurrentSaldo();
  const totalAhorros = calcTotalAhorros();
  const totalDeuda = calcTotalDeuda();
  const score = calcScore();
  const estado = getEstado(score, totalDeuda);

  // Estado card
  const estadoCard = document.getElementById('estado-card');
  estadoCard.className = `estado-card estado-${estado.cls}`;
  document.getElementById('estado-icon').innerHTML = `<i class="fas ${estado.icon}"></i>`;
  document.getElementById('estado-value').textContent = estado.label;
  document.getElementById('estado-score').textContent = score + '/100';

  // Tarjetas
  document.getElementById('dash-ingresos').textContent = fmtCOP(ingresos);
  document.getElementById('dash-gastos').textContent = fmtCOP(gastos);
  document.getElementById('dash-inversiones').textContent = fmtCOP(inversiones);
  document.getElementById('dash-saldo').textContent = fmtCOP(saldo);
  document.getElementById('dash-ahorros').textContent = fmtCOP(totalAhorros);
  document.getElementById('dash-deuda').textContent = fmtCOP(totalDeuda);

  // Color saldo
  const saldoEl = document.getElementById('dash-saldo');
  saldoEl.style.color = saldo < 0 ? 'var(--expense)' : 'var(--income)';

  // Comparaciones
  const comps = generateComparisons();
  const compList = document.getElementById('comparison-list');
  if (comps.length === 0) {
    compList.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><p>Registra más datos para ver comparaciones</p></div>';
  } else {
    compList.innerHTML = comps.map(c => `
      <div class="comparison-item">
        <div class="comp-icon">${c.icon}</div>
        <div class="comp-text">${c.text}</div>
        <div class="comp-status ${c.status}">${c.label}</div>
      </div>`).join('');
  }

  // Alertas
  const alerts = generateAlerts();
  const alertsList = document.getElementById('alerts-list');
  alertsList.innerHTML = alerts.map(a => `
    <div class="alert-item ${a.type}">
      <div class="alert-icon"><i class="fas ${a.icon}"></i></div>
      <div class="alert-text">${a.text}</div>
    </div>`).join('');

  // Últimos movimientos
  const recent = [...APP.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const recentList = document.getElementById('recent-list');
  if (recent.length === 0) {
    recentList.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>No hay movimientos registrados</p></div>';
  } else {
    recentList.innerHTML = recent.map(renderTxItem).join('');
  }

  // Mes display
  document.getElementById('month-display').textContent = getMonthShort(currentMonth, currentYear);
  document.getElementById('dash-month-label').textContent = getMonthLabel(currentMonth, currentYear);

  // Gráficas
  setTimeout(() => {
    renderWeeklyChart();
    renderGastosPieChart();
    renderIngresosPieChart();
  }, 100);
}

// =============================================
// MOVIMIENTOS
// =============================================

function renderMovimientos() {
  const search = document.getElementById('mov-search')?.value?.toLowerCase() || '';
  let txs = [...APP.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  if (movFilter !== 'todos') txs = txs.filter(tx => tx.type === movFilter);
  if (search) txs = txs.filter(tx =>
    (tx.description || '').toLowerCase().includes(search) ||
    getCategoryLabel(tx.category).toLowerCase().includes(search)
  );

  const list = document.getElementById('movimientos-list');
  if (txs.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No hay movimientos que coincidan</p></div>';
  } else {
    list.innerHTML = txs.map(renderTxItem).join('');
  }
}

// =============================================
// INGRESOS
// =============================================

function renderIngresos() {
  const txs = APP.transactions.filter(tx => tx.type === 'ingreso').sort((a, b) => b.date.localeCompare(a.date));
  const list = document.getElementById('ingresos-list');
  if (txs.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-arrow-trend-up"></i><p>No tienes ingresos registrados</p></div>';
  } else {
    list.innerHTML = txs.map(renderTxItem).join('');
  }
}

// =============================================
// GASTOS
// =============================================

function renderGastos() {
  const txs = APP.transactions.filter(tx => tx.type === 'gasto').sort((a, b) => b.date.localeCompare(a.date));
  const list = document.getElementById('gastos-list');
  if (txs.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-arrow-trend-down"></i><p>No tienes gastos registrados</p></div>';
  } else {
    list.innerHTML = txs.map(renderTxItem).join('');
  }
}

// =============================================
// INVERSIONES
// =============================================

function renderInversiones() {
  const totalInv = APP.investments.reduce((s, i) => s + (i.initialAmount || 0), 0);
  const totalVal = APP.investments.reduce((s, i) => s + (i.currentValue || 0), 0);
  const roi = totalInv > 0 ? ((totalVal - totalInv) / totalInv * 100).toFixed(2) : 0;
  const roiReal = (roi - COLOMBIA.inflacionAnual / 12).toFixed(2);

  document.getElementById('inv-summary').innerHTML = `
    <div class="inv-stat"><span class="inv-stat-label">Total invertido</span><span class="inv-stat-value">${fmtCOP(totalInv)}</span></div>
    <div class="inv-stat"><span class="inv-stat-label">Valor actual</span><span class="inv-stat-value" style="color:${totalVal >= totalInv ? 'var(--income)' : 'var(--expense)'}">${fmtCOP(totalVal)}</span></div>
    <div class="inv-stat"><span class="inv-stat-label">ROI vs Inflación</span><span class="inv-stat-value" style="color:${roiReal > 0 ? 'var(--income)' : 'var(--expense)'}">${roi}% / ${roiReal}% real</span></div>`;

  const list = document.getElementById('inversiones-list');
  if (APP.investments.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No tienes inversiones registradas</p></div>';
    return;
  }
  list.innerHTML = APP.investments.map(inv => {
    const roi = calcInvROI(inv).toFixed(2);
    const roiColor = roi >= 0 ? 'var(--income)' : 'var(--expense)';
    return `
      <div class="tx-item">
        <div class="tx-icon inversion"><i class="fas ${getCategoryIcon(inv.type)}"></i></div>
        <div class="tx-info">
          <div class="tx-desc">${inv.name}</div>
          <div class="tx-meta">
            <span class="tx-cat">${getCategoryLabel(inv.type)}</span>
            <span>${fmtDate(inv.date)}</span>
            ${inv.businessName ? `<span>📦 ${inv.businessName}</span>` : ''}
          </div>
        </div>
        <div class="tx-right">
          <div class="tx-amount inversion">${fmtCOP(inv.currentValue || inv.initialAmount)}</div>
          <div class="tx-date" style="color:${roiColor}">ROI: ${roi}%</div>
        </div>
        <div class="tx-actions">
          <button class="tx-btn" onclick="openInvMovement('${inv.id}')" title="Registrar movimiento"><i class="fas fa-plus"></i></button>
          <button class="tx-btn delete" onclick="deleteInv('${inv.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </div>`;
  }).join('');
}

function openInvMovement(invId) {
  const inv = APP.investments.find(i => i.id === invId);
  if (!inv) return;
  document.getElementById('add-modal-title').textContent = `Movimiento: ${inv.name}`;
  document.getElementById('add-modal-body').innerHTML = `
    <div class="type-tabs">
      <button class="type-tab active" onclick="setInvMovType('aporte', this)">Aporte</button>
      <button class="type-tab" onclick="setInvMovType('retiro', this)">Retiro</button>
      <button class="type-tab" onclick="setInvMovType('rendimiento', this)">Rendimiento</button>
    </div>
    <div class="form-group"><label>Monto (COP)</label><input type="number" id="f-amount" placeholder="0" min="0" class="amount-big" /></div>
    <div class="form-group"><label>Fecha</label><input type="date" id="f-date" value="${todayStr()}" /></div>
    <div class="form-group"><label>Notas</label><textarea id="f-notes"></textarea></div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAddModal()">Cancelar</button>
      <button class="btn-primary" onclick="doInvMovement('${invId}')"><i class="fas fa-check"></i> Guardar</button>
    </div>`;
  document.getElementById('add-modal').classList.remove('hidden');
}

let invMovType = 'aporte';
function setInvMovType(type, btn) {
  invMovType = type;
  document.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function doInvMovement(invId) {
  const amount = parseFloat(document.getElementById('f-amount')?.value);
  const date = document.getElementById('f-date')?.value;
  const notes = document.getElementById('f-notes')?.value;
  if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }
  addInvestmentMovement(invId, { direction: invMovType, amount, date, notes });
  showToast('Movimiento registrado ✓', 'success');
  closeAddModal();
  refreshAll();
}

function deleteInv(id) {
  showConfirm('Eliminar inversión', '¿Seguro que quieres eliminar esta inversión?', () => {
    deleteInvestment(id);
    showToast('Inversión eliminada', 'success');
    refreshAll();
  });
}

// =============================================
// AHORROS
// =============================================

function renderAhorros() {
  // Goals grid
  const goalsGrid = document.getElementById('ahorros-goals');
  if (APP.savingGoals.length === 0) {
    goalsGrid.innerHTML = '<div class="empty-state"><i class="fas fa-piggy-bank"></i><p>No tienes metas de ahorro. Crea una para empezar.</p></div>';
  } else {
    goalsGrid.innerHTML = APP.savingGoals.map(goal => {
      const { bal, tgt, pct } = calcGoalProgress(goal);
      const eta = calcGoalETA(goal);
      const etaText = eta ? (eta.done ? '¡Meta alcanzada! 🎉' : `Aprox. ${eta.monthsLeft} mes(es) al ritmo actual`) : 'Sin historial suficiente';
      const icons = { proyecto_ahorro: '💡', inmueble_ahorro: '🏠', estudio: '🎓', emergencia: '🛡️', viaje_ahorro: '✈️', otro_ahorro: '🐷' };
      return `
        <div class="goal-card">
          <div class="goal-icon">${icons[goal.type] || '🐷'}</div>
          <div class="goal-name">${goal.name}</div>
          <div class="goal-amounts"><span>${fmtCOP(bal)}</span><span>Meta: ${tgt > 0 ? fmtCOP(tgt) : '—'}</span></div>
          <div class="goal-prog-bar"><div class="goal-prog-fill" style="width:${pct}%"></div></div>
          <div class="goal-pct">${pct.toFixed(1)}%</div>
          <div class="goal-eta">${etaText}</div>
          <div class="goal-actions">
            <button class="btn-primary" style="padding:6px 10px;font-size:0.78rem;" onclick="quickSavingAction('${goal.id}', 'deposito')"><i class="fas fa-plus"></i> Depositar</button>
            <button class="btn-secondary" style="padding:6px 10px;font-size:0.78rem;" onclick="quickSavingAction('${goal.id}', 'retiro')"><i class="fas fa-minus"></i> Retirar</button>
            <button class="tx-btn delete" onclick="deleteGoal('${goal.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
    }).join('');
  }

  // Lista de movimientos de ahorro
  const movs = [...APP.savingMovements].sort((a, b) => b.date.localeCompare(a.date));
  const list = document.getElementById('ahorros-list');
  if (movs.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>No hay movimientos de ahorro</p></div>';
  } else {
    list.innerHTML = movs.map(m => `
      <div class="tx-item">
        <div class="tx-icon ahorro"><i class="fas ${m.direction === 'deposito' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i></div>
        <div class="tx-info">
          <div class="tx-desc">${m.goalName}: ${m.direction === 'deposito' ? 'Depósito' : 'Retiro'}</div>
          <div class="tx-meta"><span>${m.notes || ''}</span></div>
        </div>
        <div class="tx-right">
          <div class="tx-amount ahorro" style="color:${m.direction === 'deposito' ? 'var(--saving)' : 'var(--expense)'}">${m.direction === 'deposito' ? '+' : '-'}${fmtCOP(m.amount)}</div>
          <div class="tx-date">${fmtDate(m.date)}</div>
        </div>
      </div>`).join('');
  }
}

function quickSavingAction(goalId, direction) {
  ahorroMode = direction;
  openAddModal('ahorro');
  setTimeout(() => {
    const btn = document.querySelector(`.type-tab:nth-child(${direction === 'deposito' ? 1 : 2})`);
    if (btn) setAhorroMode(direction, btn);
    const sel = document.getElementById('f-goal-id') || document.getElementById('f-goal-id-ret');
    if (sel) sel.value = goalId;
  }, 100);
}

function deleteGoal(id) {
  showConfirm('Eliminar meta', '¿Seguro que quieres eliminar esta meta de ahorro?', () => {
    deleteSavingGoal(id);
    showToast('Meta eliminada', 'success');
    refreshAll();
  });
}

// =============================================
// DEUDAS
// =============================================

function renderDeudas() {
  const list = document.getElementById('deudas-list');
  const activeDebts = APP.debts.filter(d => !d.paid);
  const paidDebts = APP.debts.filter(d => d.paid);

  if (APP.debts.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-file-invoice-dollar"></i><p>No tienes deudas registradas. ¡Excelente!</p></div>';
    return;
  }

  const renderDebtCard = (debt) => {
    const paid = debt.payments?.reduce((s, p) => s + (p.capital || 0), 0) || 0;
    const total = debt.totalAmount || 0;
    const pct = total > 0 ? Math.min(100, (paid / total * 100)) : 0;
    const advice = getDebtAdvice(debt);
    return `
      <div class="debt-card" id="debt-${debt.id}">
        <div class="debt-header">
          <div class="debt-type-icon"><i class="fas ${getCategoryIcon(debt.type) || 'fa-file-invoice-dollar'}"></i></div>
          <div>
            <div class="debt-title">${debt.name}</div>
            <div class="debt-for">${debt.purpose || debt.creditor || ''}</div>
          </div>
          <div class="debt-badge ${debt.riskLevel || 'ok'}">${debt.riskLevel === 'danger' ? '⚠️ Usura' : debt.riskLevel === 'warn' ? '⚡ Alta' : '✓ Normal'}</div>
        </div>
        <div class="debt-progress">
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text2);">
            <span>Pagado: ${fmtCOP(paid)}</span>
            <span>Pendiente: ${fmtCOP(debt.remainingBalance || 0)}</span>
          </div>
          <div class="debt-prog-bar"><div class="debt-prog-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="debt-details">
          <div class="debt-detail">
            <span class="debt-det-label">Total deuda</span>
            <span class="debt-det-value">${fmtCOP(total)}</span>
          </div>
          <div class="debt-detail">
            <span class="debt-det-label">Cuota mensual</span>
            <span class="debt-det-value">${fmtCOP(debt.monthlyPayment || 0)}</span>
          </div>
          <div class="debt-detail">
            <span class="debt-det-label">Tasa mensual</span>
            <span class="debt-det-value" style="color:${debt.riskLevel === 'danger' ? 'var(--danger)' : 'var(--text)'}">${debt.monthlyInterest || 0}%</span>
          </div>
          <div class="debt-detail">
            <span class="debt-det-label">Tasa anual E.A.</span>
            <span class="debt-det-value">${(debt.annualInterest || 0).toFixed(2)}%</span>
          </div>
          <div class="debt-detail">
            <span class="debt-det-label">Plazo</span>
            <span class="debt-det-value">${debt.termMonths || '—'} meses</span>
          </div>
          <div class="debt-detail">
            <span class="debt-det-label">Inicio</span>
            <span class="debt-det-value">${fmtDate(debt.startDate)}</span>
          </div>
        </div>
        <div style="font-size:0.82rem;color:var(--text2);margin-bottom:12px;padding:8px;background:var(--bg3);border-radius:6px;">${advice}</div>
        ${debt.paid ? '<div style="color:var(--income);font-weight:700;padding:8px 0;">✅ Deuda pagada</div>' : `
        <div class="debt-actions">
          <button class="btn-primary" onclick="openPayDebt('${debt.id}')"><i class="fas fa-dollar-sign"></i> Pagar cuota</button>
          <button class="btn-secondary" onclick="deleteDebtConfirm('${debt.id}')"><i class="fas fa-trash"></i></button>
        </div>`}
      </div>`;
  };

  let html = '';
  if (activeDebts.length > 0) html += activeDebts.map(renderDebtCard).join('');
  if (paidDebts.length > 0) {
    html += `<div class="section-title" style="margin-top:20px;">Deudas pagadas</div>`;
    html += paidDebts.map(renderDebtCard).join('');
  }
  list.innerHTML = html;
}

function deleteDebtConfirm(id) {
  showConfirm('Eliminar deuda', '¿Seguro que quieres eliminar esta deuda?', () => {
    deleteDebt(id);
    showToast('Deuda eliminada', 'success');
    refreshAll();
  });
}

// =============================================
// REPORTES
// =============================================

function renderReportes() {
  setTimeout(() => {
    renderMonthlyChart();
    renderIncomeTypeChart();
    renderExpenseCatChart();
  }, 100);
  document.getElementById('reportes-analysis').innerHTML = generateAnalysis(reportPeriod);
  poblarSelectsComparacion();
  renderTopGastos();
  renderFrecuentes();
  renderComparacion();
}

function setReportSection(section, btn) {
  document.querySelectorAll('.report-section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.report-section-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('rs-' + section).classList.remove('hidden');
  if (btn) btn.classList.add('active');
  if (section === 'graficas') setTimeout(() => { renderMonthlyChart(); renderIncomeTypeChart(); renderExpenseCatChart(); }, 100);
  if (section === 'top-gastos') renderTopGastos();
  if (section === 'frecuentes') renderFrecuentes();
  if (section === 'comparacion') renderComparacion();
}

function getTxPeriodo(tipo) {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  if (reportPeriod === 'mes') {
    return APP.transactions.filter(tx => {
      const d = new Date(tx.date + 'T12:00:00');
      return d.getMonth() === m && d.getFullYear() === y && (!tipo || tx.type === tipo);
    });
  }
  if (reportPeriod === 'trimestre') {
    const inicio = new Date(y, m - 2, 1);
    return APP.transactions.filter(tx => {
      const d = new Date(tx.date + 'T12:00:00');
      return d >= inicio && (!tipo || tx.type === tipo);
    });
  }
  return APP.transactions.filter(tx => {
    const d = new Date(tx.date + 'T12:00:00');
    return d.getFullYear() === y && (!tipo || tx.type === tipo);
  });
}

function renderTopGastos() {
  const gastos = getTxPeriodo('gasto').sort((a, b) => b.amount - a.amount).slice(0, 10);
  const container = document.getElementById('top-gastos-list');
  if (!gastos.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>Sin gastos en este periodo</p></div>';
    return;
  }
  const ranks = ['🥇','🥈','🥉'];
  const rankCls = ['gold','silver','bronze'];
  const catLabel = id => (TIPOS_GASTO.find(t => t.id === id) || {label: id}).label;
  container.innerHTML = gastos.map((tx, i) => `
    <div class="top-gasto-item">
      <div class="top-gasto-rank ${rankCls[i] || ''}">${ranks[i] || '#'+(i+1)}</div>
      <div class="top-gasto-info">
        <div class="top-gasto-desc">${tx.description || catLabel(tx.category)}</div>
        <div class="top-gasto-cat">${catLabel(tx.category)} · ${tx.date}</div>
      </div>
      <div class="top-gasto-amount">-${fmtCOP(tx.amount)}</div>
    </div>`).join('');
}

function renderFrecuentes() {
  const gastos = getTxPeriodo('gasto');
  const container = document.getElementById('frecuentes-list');
  if (!gastos.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-repeat"></i><p>Sin gastos en este periodo</p></div>';
    return;
  }
  const freq = {}, totales = {};
  gastos.forEach(tx => {
    const k = tx.category || 'otro_gasto';
    freq[k] = (freq[k] || 0) + 1;
    totales[k] = (totales[k] || 0) + tx.amount;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const maxFreq = sorted[0][1];
  const catLabel = id => (TIPOS_GASTO.find(t => t.id === id) || {label: id}).label;
  container.innerHTML = sorted.map(([cat, count]) => `
    <div class="freq-item">
      <div class="freq-bar-wrap">
        <div class="freq-label">
          <span>${catLabel(cat)}</span>
          <span style="color:var(--expense);font-weight:700;">${fmtCOP(totales[cat])}</span>
        </div>
        <div class="freq-bar-bg">
          <div class="freq-bar-fill" style="width:${Math.round(count/maxFreq*100)}%"></div>
        </div>
      </div>
      <div class="freq-count">${count} vez${count>1?'es':''}</div>
    </div>`).join('');
}

function poblarSelectsComparacion() {
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const now = new Date();
  const opciones = [];
  for (let i = 12; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opciones.push({ label: `${meses[d.getMonth()]} ${d.getFullYear()}`, m: d.getMonth(), y: d.getFullYear() });
  }
  const makeOptions = (selIdx) => opciones.map((o, i) =>
    `<option value="${o.m},${o.y}" ${i===selIdx?'selected':''}>${o.label}</option>`).join('');
  const selA = document.getElementById('cmp-mes-a');
  const selB = document.getElementById('cmp-mes-b');
  if (selA && selB) {
    selA.innerHTML = makeOptions(opciones.length - 2);
    selB.innerHTML = makeOptions(opciones.length - 1);
  }
}

function renderComparacion() {
  const selA = document.getElementById('cmp-mes-a');
  const selB = document.getElementById('cmp-mes-b');
  const container = document.getElementById('comparacion-result');
  if (!selA || !selB || !container) return;
  const [mA, yA] = selA.value.split(',').map(Number);
  const [mB, yB] = selB.value.split(',').map(Number);
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const txA = APP.transactions.filter(tx => { const d = new Date(tx.date+'T12:00:00'); return d.getMonth()===mA && d.getFullYear()===yA; });
  const txB = APP.transactions.filter(tx => { const d = new Date(tx.date+'T12:00:00'); return d.getMonth()===mB && d.getFullYear()===yB; });
  const sum = (txs, tipo) => txs.filter(t => t.type===tipo).reduce((s,t)=>s+t.amount,0);
  const ingA=sum(txA,'ingreso'), ingB=sum(txB,'ingreso');
  const gasA=sum(txA,'gasto'),   gasB=sum(txB,'gasto');
  const invA=sum(txA,'inversion'), invB=sum(txB,'inversion');
  const balA=ingA-gasA-invA, balB=ingB-gasB-invB;
  const cntA=txA.filter(t=>t.type==='gasto').length, cntB=txB.filter(t=>t.type==='gasto').length;

  const diff = (a, b, inv=false) => {
    if (a===0 && b===0) return '';
    const d=b-a, pct=a>0?Math.abs(d/a*100).toFixed(1):'—';
    const mejor = inv ? d<0 : d>0;
    return `<span class="${mejor?'cmp-diff-pos':'cmp-diff-neg'}">${d>0?'▲':'▼'} ${pct}%</span>`;
  };
  const row = (label, a, b, inv=false) => `
    <div class="cmp-row">
      <span class="cmp-label">${label}</span>
      <div class="cmp-vals">
        <span class="cmp-a">${fmtCOP(a)}</span>
        <span class="cmp-b">${fmtCOP(b)}</span>
        ${diff(a,b,inv)}
      </div>
    </div>`;

  const msgBalance = balB>balA
    ? `<div style="background:rgba(0,201,167,0.1);border:1px solid var(--accent);border-radius:10px;padding:12px;font-size:0.85rem;color:var(--accent);">✅ <strong>${meses[mB]}</strong> fue mejor — balance mejoró ${fmtCOP(balB-balA)}</div>`
    : balA>balB
    ? `<div style="background:rgba(255,80,80,0.08);border:1px solid var(--expense);border-radius:10px;padding:12px;font-size:0.85rem;color:var(--expense);">⚠️ <strong>${meses[mB]}</strong> estuvo por debajo — balance bajó ${fmtCOP(balA-balB)}</div>`
    : `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:0.85rem;color:var(--text2);">➡️ Ambos meses tuvieron el mismo balance</div>`;

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.8rem;font-weight:700;padding:0 4px;">
      <span></span>
      <div style="display:flex;gap:16px;">
        <span style="color:var(--accent);">${meses[mA]}</span>
        <span style="color:var(--warning);">${meses[mB]}</span>
        <span style="color:var(--text3);min-width:50px;">Δ</span>
      </div>
    </div>
    <div class="cmp-card">
      ${row('💰 Ingresos', ingA, ingB)}
      ${row('🔴 Gastos', gasA, gasB, true)}
      ${row('📈 Inversiones', invA, invB)}
      ${row('✅ Balance', balA, balB)}
      ${row('🔢 N° gastos', cntA, cntB, true)}
    </div>
    ${msgBalance}`;
}

async function runIAAnalysis() {
  const btn = document.querySelector('#rs-ia .btn-primary');
  const loading = document.getElementById('ia-loading');
  const result = document.getElementById('ia-result');
  if (btn) btn.disabled = true;
  loading.classList.remove('hidden');
  result.innerHTML = '';

  const gastos = getTxPeriodo('gasto');
  const ingresos = getTxPeriodo('ingreso');
  const totalGastos = gastos.reduce((s,t)=>s+t.amount,0);
  const totalIngresos = ingresos.reduce((s,t)=>s+t.amount,0);
  const balance = totalIngresos - totalGastos;
  const freq = {};
  gastos.forEach(tx => { freq[tx.category]=(freq[tx.category]||0)+tx.amount; });
  const topCats = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([cat,amt])=>`${(TIPOS_GASTO.find(t=>t.id===cat)||{label:cat}).label}: ${fmtCOP(amt)}`).join(', ');

  const p = APP.profile;
  const periodo = reportPeriod==='mes'?'Este mes':reportPeriod==='trimestre'?'Últimos 3 meses':'Este año';
  const prompt = `Eres un asesor financiero experto en finanzas personales para Colombia. Analiza esta información y da consejos prácticos y personalizados. Responde en español con secciones claras.

PERFIL: ${p.name||'Usuario'}, ${p.occupation||''}, ${p.city||'Colombia'}, trabajo: ${p.workType||'empleado'}
PERIODO: ${periodo}
INGRESOS: ${fmtCOP(totalIngresos)}
GASTOS: ${fmtCOP(totalGastos)}
BALANCE: ${fmtCOP(balance)}
RATIO GASTO/INGRESO: ${totalIngresos>0?(totalGastos/totalIngresos*100).toFixed(1):'N/A'}%
TOP GASTOS POR CATEGORÍA: ${topCats||'Sin datos'}
DEUDAS ACTIVAS: ${fmtCOP(calcTotalDeuda())}
AHORROS: ${fmtCOP(calcTotalAhorros())}
SALDO DISPONIBLE: ${fmtCOP(getCurrentSaldo())}
SALARIO MÍNIMO 2026: $1.750.905 | INFLACIÓN: 5.56% | TASA USURA: 26.76% E.A.

Responde con estas secciones:
### 📊 Diagnóstico general
### ⚠️ Alertas
### 💡 Top 3 recomendaciones
### 🎯 Meta para el próximo mes`;

  try {
    const GEMINI_KEY = 'AIzaSyC5Jnb48f5dAHq-lLKIMcib_BiCzUAYu-0';
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
        })
      }
    );

    if (!resp.ok) {
      const errData = await resp.json();
      const errMsg = errData?.error?.message || 'Error desconocido';
      result.innerHTML = `<div class="analysis-block" style="color:var(--expense);">❌ Error de Gemini: ${errMsg}</div>`;
      loading.classList.add('hidden');
      if (btn) btn.disabled = false;
      return;
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      result.innerHTML = `<div class="analysis-block" style="color:var(--expense);">❌ Gemini no devolvió respuesta. Intenta de nuevo.</div>`;
      loading.classList.add('hidden');
      if (btn) btn.disabled = false;
      return;
    }

    const html = text
      .replace(/### (.+)/g, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)/gm, '<li>$1</li>')
      .replace(/

/g, '<br/><br/>');
    result.innerHTML = `<div class="ia-result-block">${html}</div>`;

  } catch(e) {
    result.innerHTML = `<div class="analysis-block" style="color:var(--expense);">❌ Error: ${e.message || 'Revisa tu conexión e intenta de nuevo.'}</div>`;
  }
  loading.classList.add('hidden');
  if (btn) btn.disabled = false;
}


// =============================================
// JUEGOS DE AZAR
// =============================================

function renderAzar() {
  const azarGastos = APP.transactions.filter(tx => tx.category === 'azar_gasto');
  const azarGanancias = APP.transactions.filter(tx => tx.category === 'azar');
  const totalGastado = azarGastos.reduce((s, tx) => s + tx.amount, 0);
  const totalGanado = azarGanancias.reduce((s, tx) => s + tx.amount, 0);
  const balance = totalGanado - totalGastado;

  document.getElementById('azar-summary').innerHTML = `
    <div class="azar-stat"><span class="azar-stat-label">Total apostado</span><span class="azar-stat-value" style="color:var(--expense)">${fmtCOP(totalGastado)}</span></div>
    <div class="azar-stat"><span class="azar-stat-label">Total ganado</span><span class="azar-stat-value" style="color:var(--income)">${fmtCOP(totalGanado)}</span></div>
    <div class="azar-stat"><span class="azar-stat-label">Balance neto</span><span class="azar-stat-value" style="color:${balance >= 0 ? 'var(--income)' : 'var(--expense)'}">${fmtCOP(balance)}</span></div>`;

  document.getElementById('azar-advice').textContent = generateGamblingAdvice();

  const all = [...azarGastos, ...azarGanancias].sort((a, b) => b.date.localeCompare(a.date));
  const list = document.getElementById('azar-list');
  if (all.length === 0) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-dice"></i><p>No hay movimientos de azar registrados</p></div>';
  } else {
    list.innerHTML = all.map(tx => renderTxItem(tx)).join('');
  }

  setTimeout(() => renderAzarChart(), 100);
}

// =============================================
// PERFIL
// =============================================

function renderPerfil() {
  const p = APP.profile;
  const tags = [
    p.city ? `📍 ${p.city}` : '',
    p.hasPartner ? '❤️ Con pareja' : '',
    p.hasChildren ? '👶 Con hijos' : '',
    p.hasPets ? '🐾 Mascotas' : '',
    p.housing ? ({ arriendo: '🏠 Arriendo', hipoteca: '🏡 Hipoteca', propia: '🏠 Casa propia', familiar: '🏠 Casa familiar' }[p.housing] || '') : '',
    p.hasProject ? `🚀 ${p.projectName || 'Proyecto propio'}` : '',
    p.hasCreditCard ? '💳 Tarjeta crédito' : ''
  ].filter(Boolean);

  document.getElementById('profile-info-display').innerHTML = `
    <div class="profile-name">${p.name || 'Sin nombre'}</div>
    <div class="profile-occ">${p.occupation || '—'} · ${{ empleado: 'Empleado', independiente: 'Independiente', mixto: 'Mixto', desempleado: 'Desempleado', pensionado: 'Pensionado', estudiante: 'Estudiante' }[p.workType] || p.workType}</div>
    <div class="profile-tags">${tags.map(t => `<span class="profile-tag">${t}</span>`).join('')}</div>
    <div style="margin-top:12px;font-size:0.85rem;color:var(--text2);">
      Salario: <strong>${p.monthlySalary > 0 ? fmtCOP(p.monthlySalary) : 'No declarado'}</strong> · 
      Sustenta a: <strong>${p.peopleSupport} persona(s)</strong> · 
      Convive con: <strong>${p.peopleAtHome} persona(s)</strong>
    </div>`;

  document.getElementById('indicators-table').innerHTML = `
    <div class="ind-row"><span class="ind-row-label">Salario mínimo 2026</span><span class="ind-row-val">${fmtCOP(COLOMBIA.salarioMinimo)}</span></div>
    <div class="ind-row"><span class="ind-row-label">Auxilio de transporte 2026</span><span class="ind-row-val">${fmtCOP(COLOMBIA.auxilioTransporte)}</span></div>
    <div class="ind-row"><span class="ind-row-label">Salario vital 2026</span><span class="ind-row-val">${fmtCOP(COLOMBIA.salarioVital)}</span></div>
    <div class="ind-row"><span class="ind-row-label">Inflación anual (IPC mar 2026)</span><span class="ind-row-val" style="color:var(--warning)">${COLOMBIA.inflacionAnual}%</span></div>
    <div class="ind-row"><span class="ind-row-label">Inflación mensual (mar 2026)</span><span class="ind-row-val">${COLOMBIA.inflacionMensual}%</span></div>
    <div class="ind-row"><span class="ind-row-label">Interés bancario corriente (abr 2026)</span><span class="ind-row-val">${COLOMBIA.interesBC}% E.A.</span></div>
    <div class="ind-row"><span class="ind-row-label">Tasa de usura (abr 2026)</span><span class="ind-row-val" style="color:var(--danger)">${COLOMBIA.tasaUsura}% E.A.</span></div>
    <div class="ind-row"><span class="ind-row-label">Mejor CDT disponible (abr 2026)</span><span class="ind-row-val" style="color:var(--income)">${COLOMBIA.mejorCDT}% E.A.</span></div>
    <div class="ind-row" style="font-size:0.75rem;"><span class="ind-row-label" style="color:var(--text3)">Fuente: DANE / Superfinanciera Colombia</span><span class="ind-row-val" style="color:var(--text3)">Abr 2026</span></div>`;
}
