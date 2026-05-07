/* =============================================
   UI.JS - Interfaces y modales de formularios
   Smart Finance Personal
   ============================================= */

'use strict';

// =============================================
// TOAST
// =============================================
function showToast(msg, type = 'info', duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || '');
  setTimeout(() => t.classList.add('hidden'), duration);
}

// =============================================
// CONFIRM MODAL
// =============================================
function showConfirm(title, msg, onOk) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-modal').classList.remove('hidden');
  document.getElementById('confirm-ok-btn').onclick = () => { closeConfirm(); onOk(); };
}
function closeConfirm() { document.getElementById('confirm-modal').classList.add('hidden'); }

// =============================================
// SALDO INSUFICIENTE MODAL
// =============================================
let _pendingOperation = null;

function showSaldoInsuficiente(amount, saldo, onComplete) {
  const diff = amount - saldo;
  document.getElementById('saldo-modal-msg').textContent =
    `Necesitas ${fmtCOP(amount)} pero tu saldo disponible es ${fmtCOP(saldo)}. Te faltan ${fmtCOP(diff)}. ¿Cómo cubrirás la diferencia?`;
  const opts = document.getElementById('source-options');
  opts.innerHTML = '';

  const totalAhorros = calcTotalAhorros();
  if (totalAhorros >= diff) {
    opts.innerHTML += `<div class="source-option" onclick="chooseSaldoSource('ahorros', ${diff})"><i class="fas fa-piggy-bank"></i> Sacar ${fmtCOP(diff)} de mis ahorros</div>`;
  }
  opts.innerHTML += `<div class="source-option" onclick="chooseSaldoSource('deuda', ${diff})"><i class="fas fa-file-invoice-dollar"></i> Registrar nueva deuda por ${fmtCOP(diff)}</div>`;
  opts.innerHTML += `<div class="source-option" onclick="chooseSaldoSource('ingreso', ${diff})"><i class="fas fa-plus-circle"></i> Registrar ingreso pendiente</div>`;
  opts.innerHTML += `<div class="source-option" onclick="chooseSaldoSource('cancel', 0)"><i class="fas fa-times"></i> Cancelar operación</div>`;

  _pendingOperation = { amount, saldo, onComplete };
  document.getElementById('saldo-modal').classList.remove('hidden');
}

function chooseSaldoSource(source, diff) {
  closeSaldoModal();
  if (!_pendingOperation) return;
  const { onComplete } = _pendingOperation;
  _pendingOperation = null;
  if (source === 'cancel') return;
  onComplete(source, diff);
}

function closeSaldoModal() { document.getElementById('saldo-modal').classList.add('hidden'); }

// =============================================
// QUICK ADD MODAL
// =============================================
let currentAddType = 'gasto';

function openQuickAdd() {
  openAddModal('gasto');
}

function openAddModal(type = 'gasto', editData = null) {
  currentAddType = type;
  const titles = { gasto: 'Registrar gasto', ingreso: 'Registrar ingreso', inversion: 'Nueva inversión', ahorro: 'Mover a ahorro', deuda: 'Nueva deuda', azar: 'Registrar apuesta' };
  document.getElementById('add-modal-title').textContent = editData ? 'Editar movimiento' : (titles[type] || 'Nuevo movimiento');
  document.getElementById('add-modal-body').innerHTML = buildAddForm(type, editData);
  document.getElementById('add-modal').classList.remove('hidden');
  // Enfocar primer campo
  setTimeout(() => {
    const first = document.querySelector('#add-modal-body input');
    if (first) first.focus();
  }, 100);
}

function closeAddModal() { document.getElementById('add-modal').classList.add('hidden'); }

function buildAddForm(type, editData) {
  if (type === 'gasto') return buildGastoForm(editData);
  if (type === 'ingreso') return buildIngresoForm(editData);
  if (type === 'inversion') return buildInversionForm(editData);
  if (type === 'ahorro') return buildAhorroForm(editData);
  if (type === 'deuda') return buildDeudaForm(editData);
  if (type === 'azar') return buildAzarForm(editData);
  return '';
}

// ---- GASTO ----
function buildGastoForm(editData) {
  const tipos = TIPOS_GASTO.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
  const subtVehiculo = SUBTIPOS_VEHICULO.map(s => `<option>${s}</option>`).join('');
  return `
    <div class="form-group">
      <label>Descripción</label>
      <input type="text" id="f-desc" placeholder="Ej: agua, almuerzo, taxi..." oninput="autoClassifyInput()" value="${editData?.description || ''}" />
      <div class="hint-text" id="f-hint"></div>
    </div>
    <div class="form-group">
      <label>Monto (COP)</label>
      <input type="number" id="f-amount" placeholder="0" min="0" class="amount-big" value="${editData?.amount || ''}" />
    </div>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="f-date" value="${editData?.date || todayStr()}" />
    </div>
    <div class="form-group">
      <label>Categoría <span id="f-cat-auto" style="color:var(--accent);font-size:0.78rem;"></span></label>
      <select id="f-category">${tipos}</select>
    </div>
    <div class="form-group hidden" id="f-vehiculo-sub">
      <label>Subtipo vehículo</label>
      <select id="f-vehiculo-type"><option value="">Seleccionar...</option>${subtVehiculo}</select>
    </div>
    <div class="form-group">
      <label>Notas (opcional)</label>
      <textarea id="f-notes" placeholder="Notas adicionales...">${editData?.notes || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAddModal()">Cancelar</button>
      <button class="btn-primary" onclick="submitGasto('${editData?.id || ''}')"><i class="fas fa-check"></i> Guardar</button>
    </div>`;
}

// ---- INGRESO ----
function buildIngresoForm(editData) {
  const tipos = TIPOS_INGRESO.map(t => `<option value="${t.id}" ${t.isDebt ? 'data-debt="true"' : ''}>${t.label}</option>`).join('');
  return `
    <div class="form-group">
      <label>Descripción</label>
      <input type="text" id="f-desc" placeholder="Ej: salario mayo, venta celular..." value="${editData?.description || ''}" />
    </div>
    <div class="form-group">
      <label>Monto (COP)</label>
      <input type="number" id="f-amount" placeholder="0" min="0" class="amount-big" value="${editData?.amount || ''}" />
    </div>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="f-date" value="${editData?.date || todayStr()}" />
    </div>
    <div class="form-group">
      <label>Tipo de ingreso</label>
      <select id="f-category" onchange="checkIngresoType(this)">${tipos}</select>
    </div>
    <div class="form-group hidden" id="f-business-group">
      <label>Nombre del negocio</label>
      <input type="text" id="f-business" placeholder="Nombre del negocio o proyecto..." />
    </div>
    <div id="f-debt-notice" class="hidden" style="background:var(--debt-bg);border-radius:8px;padding:10px;font-size:0.85rem;color:var(--debt);margin-bottom:12px;">
      <i class="fas fa-info-circle"></i> Este ingreso creará automáticamente una deuda. Podrás completar los detalles después.
    </div>
    <div class="form-group">
      <label>Notas (opcional)</label>
      <textarea id="f-notes" placeholder="">${editData?.notes || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAddModal()">Cancelar</button>
      <button class="btn-primary" onclick="submitIngreso('${editData?.id || ''}')"><i class="fas fa-check"></i> Guardar</button>
    </div>`;
}

function checkIngresoType(sel) {
  const opt = sel.options[sel.selectedIndex];
  const debtNotice = document.getElementById('f-debt-notice');
  const bizGroup = document.getElementById('f-business-group');
  if (debtNotice) debtNotice.classList.toggle('hidden', opt.getAttribute('data-debt') !== 'true');
  if (bizGroup) bizGroup.classList.toggle('hidden', sel.value !== 'negocio');
}

// ---- INVERSIÓN ----
function buildInversionForm(editData) {
  const tipos = TIPOS_INVERSION.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
  return `
    <div class="form-group">
      <label>Nombre de la inversión</label>
      <input type="text" id="f-desc" placeholder="Ej: Acciones Bancolombia, CDT Banco X..." value="${editData?.description || ''}" />
    </div>
    <div class="form-group">
      <label>Tipo de inversión</label>
      <select id="f-category" onchange="checkInvType(this)">${tipos}</select>
    </div>
    <div class="form-group hidden" id="f-inv-business">
      <label>Nombre del negocio</label>
      <input type="text" id="f-business" placeholder="Nombre del negocio..." />
    </div>
    <div class="form-group">
      <label>Monto a invertir (COP)</label>
      <input type="number" id="f-amount" placeholder="0" min="0" class="amount-big" value="${editData?.amount || ''}" />
    </div>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="f-date" value="${editData?.date || todayStr()}" />
    </div>
    <div class="form-group">
      <label>Notas (opcional)</label>
      <textarea id="f-notes" placeholder="Plazo, condiciones, entidad...">${editData?.notes || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAddModal()">Cancelar</button>
      <button class="btn-primary" onclick="submitInversion()"><i class="fas fa-check"></i> Guardar</button>
    </div>`;
}

function checkInvType(sel) {
  const bizGroup = document.getElementById('f-inv-business');
  if (bizGroup) bizGroup.classList.toggle('hidden', sel.value !== 'negocio_inv');
}

// ---- AHORRO ----
function buildAhorroForm(editData) {
  const goalOpts = APP.savingGoals.length > 0
    ? APP.savingGoals.map(g => `<option value="${g.id}">${g.name} (${fmtCOP(g.balance || 0)})</option>`).join('')
    : '<option value="">— No tienes metas creadas —</option>';
  const tipos = TIPOS_AHORRO.map(t => `<option value="${t.id}">${t.label}</option>`).join('');

  return `
    <div class="type-tabs">
      <button class="type-tab active" onclick="setAhorroMode('deposito', this)"><i class="fas fa-plus"></i> Depositar</button>
      <button class="type-tab" onclick="setAhorroMode('retiro', this)"><i class="fas fa-minus"></i> Retirar</button>
      <button class="type-tab" onclick="setAhorroMode('nueva_meta', this)"><i class="fas fa-flag"></i> Nueva meta</button>
    </div>
    <div id="f-ahorro-deposito">
      <div class="form-group">
        <label>Meta de ahorro</label>
        <select id="f-goal-id">${goalOpts}</select>
      </div>
      <div class="form-group">
        <label>Monto (COP)</label>
        <input type="number" id="f-amount" placeholder="0" min="0" class="amount-big" />
      </div>
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" id="f-date" value="${todayStr()}" />
      </div>
      <div class="form-group">
        <label>Origen del dinero</label>
        <select id="f-source">
          <option value="saldo">Desde saldo disponible</option>
          <option value="externo">Fuente externa (no afecta saldo)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Notas</label>
        <textarea id="f-notes"></textarea>
      </div>
    </div>
    <div id="f-ahorro-retiro" class="hidden">
      <div class="form-group">
        <label>Meta de ahorro</label>
        <select id="f-goal-id-ret">${goalOpts}</select>
      </div>
      <div class="form-group">
        <label>Monto a retirar (COP)</label>
        <input type="number" id="f-amount-ret" placeholder="0" min="0" class="amount-big" />
      </div>
      <div class="form-group">
        <label>Destino</label>
        <select id="f-dest-ret">
          <option value="saldo">Al saldo disponible</option>
          <option value="gasto">Para cubrir un gasto</option>
          <option value="deuda">Para pagar una deuda</option>
        </select>
      </div>
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" id="f-date-ret" value="${todayStr()}" />
      </div>
    </div>
    <div id="f-ahorro-nueva" class="hidden">
      <div class="form-group">
        <label>Nombre de la meta</label>
        <input type="text" id="f-goal-name" placeholder="Ej: Fondo emergencia, Vacaciones, Carro..." />
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select id="f-goal-type">${tipos}</select>
      </div>
      <div class="form-group">
        <label>Monto objetivo (COP)</label>
        <input type="number" id="f-goal-target" placeholder="0" min="0" />
      </div>
      <div class="form-group">
        <label>Fecha objetivo</label>
        <input type="date" id="f-goal-date" />
      </div>
      <div class="form-group">
        <label>Prioridad</label>
        <select id="f-goal-priority">
          <option value="alta">Alta</option>
          <option value="media" selected>Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAddModal()">Cancelar</button>
      <button class="btn-primary" id="f-ahorro-submit" onclick="submitAhorro()"><i class="fas fa-check"></i> Guardar</button>
    </div>`;
}

let ahorroMode = 'deposito';
function setAhorroMode(mode, btn) {
  ahorroMode = mode;
  document.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('f-ahorro-deposito').classList.add('hidden');
  document.getElementById('f-ahorro-retiro').classList.add('hidden');
  document.getElementById('f-ahorro-nueva').classList.add('hidden');
  if (mode === 'deposito') document.getElementById('f-ahorro-deposito').classList.remove('hidden');
  else if (mode === 'retiro') document.getElementById('f-ahorro-retiro').classList.remove('hidden');
  else document.getElementById('f-ahorro-nueva').classList.remove('hidden');
}

// ---- DEUDA ----
function buildDeudaForm(editData) {
  const tipos = TIPOS_DEUDA.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
  return `
    <div class="form-group">
      <label>Nombre / Descripción</label>
      <input type="text" id="f-desc" placeholder="Ej: Tarjeta Davivienda, Crédito Bancolombia..." value="${editData?.name || ''}" />
    </div>
    <div class="form-group">
      <label>Tipo de deuda</label>
      <select id="f-category">${tipos}</select>
    </div>
    <div class="form-group">
      <label>¿Para qué fue?</label>
      <input type="text" id="f-purpose" placeholder="Ej: Emergencia médica, Compra de moto..." value="${editData?.purpose || ''}" />
    </div>
    <div class="form-group">
      <label>Monto total de la deuda (COP)</label>
      <input type="number" id="f-amount" placeholder="0" min="0" class="amount-big" value="${editData?.totalAmount || ''}" />
    </div>
    <div class="form-group">
      <label>¿A quién le debes?</label>
      <input type="text" id="f-creditor" placeholder="Banco, persona, entidad..." value="${editData?.creditor || ''}" />
    </div>
    <div class="form-group">
      <label>Tasa de interés mensual (%)</label>
      <input type="number" id="f-monthly-int" placeholder="0" min="0" step="0.01" value="${editData?.monthlyInterest || ''}" oninput="calcDebtAnnual()" />
      <div class="hint-text" id="f-annual-equiv">Tasa anual equivalente: —</div>
    </div>
    <div class="form-group">
      <label>Plazo (meses)</label>
      <input type="number" id="f-term" placeholder="12" min="1" value="${editData?.termMonths || ''}" />
    </div>
    <div class="form-group">
      <label>Cuota mensual (opcional — se calcula si no la pones)</label>
      <input type="number" id="f-monthly-pay" placeholder="0" min="0" value="${editData?.monthlyPayment || ''}" />
    </div>
    <div class="form-group">
      <label>Fecha de inicio</label>
      <input type="date" id="f-date" value="${editData?.startDate || todayStr()}" />
    </div>
    <div class="form-group">
      <label>Notas (opcional)</label>
      <textarea id="f-notes">${editData?.notes || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAddModal()">Cancelar</button>
      <button class="btn-primary" onclick="submitDeuda()"><i class="fas fa-check"></i> Guardar</button>
    </div>`;
}

function calcDebtAnnual() {
  const mi = parseFloat(document.getElementById('f-monthly-int')?.value) || 0;
  const ea = (Math.pow(1 + mi / 100, 12) - 1) * 100;
  const hint = document.getElementById('f-annual-equiv');
  if (!hint) return;
  if (mi === 0) { hint.textContent = 'Tasa anual equivalente: —'; return; }
  let color = 'var(--text2)';
  let warn = '';
  if (ea > COLOMBIA.tasaUsura) { color = 'var(--danger)'; warn = ' ⚠️ SUPERA LA USURA'; }
  else if (ea > COLOMBIA.interesBC) { color = 'var(--warning)'; warn = ' (por encima del interés BC)'; }
  hint.innerHTML = `<span style="color:${color}">Tasa anual equivalente: ${ea.toFixed(2)}%${warn}</span>`;
}

// ---- AZAR ----
function buildAzarForm(editData) {
  return `
    <div class="type-tabs">
      <button class="type-tab active" onclick="setAzarMode('gasto', this)"><i class="fas fa-minus"></i> Aposté / Perdí</button>
      <button class="type-tab" onclick="setAzarMode('ingreso', this)"><i class="fas fa-plus"></i> Gané</button>
    </div>
    <div class="form-group">
      <label>Descripción</label>
      <input type="text" id="f-desc" placeholder="Ej: Chance, Betplay, Casino, Lotería..." value="${editData?.description || ''}" />
    </div>
    <div class="form-group">
      <label>Monto (COP)</label>
      <input type="number" id="f-amount" placeholder="0" min="0" class="amount-big" value="${editData?.amount || ''}" />
    </div>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="f-date" value="${editData?.date || todayStr()}" />
    </div>
    <div class="form-group">
      <label>Notas</label>
      <textarea id="f-notes">${editData?.notes || ''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAddModal()">Cancelar</button>
      <button class="btn-primary" onclick="submitAzar()"><i class="fas fa-check"></i> Guardar</button>
    </div>`;
}

let azarMode = 'gasto';
function setAzarMode(mode, btn) {
  azarMode = mode;
  document.querySelectorAll('.type-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// =============================================
// AUTO-CLASIFICACIÓN EN TIEMPO REAL
// =============================================
function autoClassifyInput() {
  const desc = document.getElementById('f-desc')?.value;
  const catSel = document.getElementById('f-category');
  const hint = document.getElementById('f-hint');
  const catAuto = document.getElementById('f-cat-auto');
  if (!desc || !catSel) return;

  const classified = classifyTransaction(desc, currentAddType);
  if (classified) {
    catSel.value = classified;
    if (catAuto) catAuto.textContent = '(auto)';
    if (hint) hint.textContent = `Categoría sugerida: ${getCategoryLabel(classified)}`;

    // Mostrar subtipos si es vehículo
    const vehiculoSub = document.getElementById('f-vehiculo-sub');
    if (vehiculoSub) vehiculoSub.classList.toggle('hidden', classified !== 'vehiculo');
  } else {
    if (catAuto) catAuto.textContent = '';
    if (hint) hint.textContent = '';
  }
}

// =============================================
// SUBMIT HANDLERS
// =============================================

function submitGasto(editId) {
  const desc = document.getElementById('f-desc')?.value?.trim();
  const amount = parseFloat(document.getElementById('f-amount')?.value);
  const date = document.getElementById('f-date')?.value;
  const cat = document.getElementById('f-category')?.value;
  const notes = document.getElementById('f-notes')?.value;
  const subtype = document.getElementById('f-vehiculo-type')?.value || '';

  if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }

  const saldo = getCurrentSaldo();
  const txData = { type: 'gasto', category: cat, amount, date, description: desc, notes, subtype, autoCategorized: !document.getElementById('f-cat-auto')?.textContent };

  function doSave() {
    if (editId) {
      editTransaction(editId, txData);
      showToast('Gasto actualizado', 'success');
    } else {
      addTransaction(txData);
      if (desc) learnRule(desc, cat);
      showToast('Gasto registrado ✓', 'success');
    }
    closeAddModal();
    refreshAll();
  }

  if (!editId && saldo < amount) {
    showSaldoInsuficiente(amount, saldo, (source, diff) => {
      if (source === 'ahorros') {
        // Retirar de ahorros primero
        const firstGoal = APP.savingGoals[0];
        if (firstGoal) {
          addSavingMovement({ goalId: firstGoal.id, direction: 'retiro', amount: diff, date, notes: 'Para cubrir gasto' });
        }
      } else if (source === 'deuda') {
        // Crear deuda
        addDebt({ name: `Deuda para ${desc || 'gasto'}`, totalAmount: diff, monthlyInterest: 0, termMonths: 1, purpose: desc });
      } else if (source === 'ingreso') {
        openAddModal('ingreso');
        return;
      }
      doSave();
    });
  } else {
    doSave();
  }
}

function submitIngreso(editId) {
  const desc = document.getElementById('f-desc')?.value?.trim();
  const amount = parseFloat(document.getElementById('f-amount')?.value);
  const date = document.getElementById('f-date')?.value;
  const cat = document.getElementById('f-category')?.value;
  const notes = document.getElementById('f-notes')?.value;
  const biz = document.getElementById('f-business')?.value || '';

  if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }

  const txData = { type: 'ingreso', category: cat, amount, date, description: desc || cat, notes, businessName: biz, autoCategorized: false };
  const result = addTransaction(txData);
  if (result.needsDebt) {
    showToast('Ingreso registrado. Recuerda completar los datos de la deuda.', 'success');
    closeAddModal();
    setTimeout(() => openAddModal('deuda'), 400);
  } else {
    showToast('Ingreso registrado ✓', 'success');
    closeAddModal();
  }
  refreshAll();
}

function submitInversion() {
  const desc = document.getElementById('f-desc')?.value?.trim();
  const amount = parseFloat(document.getElementById('f-amount')?.value);
  const date = document.getElementById('f-date')?.value;
  const type = document.getElementById('f-category')?.value;
  const notes = document.getElementById('f-notes')?.value;
  const biz = document.getElementById('f-business')?.value || '';

  if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }

  const saldo = getCurrentSaldo();
  if (saldo < amount) {
    showSaldoInsuficiente(amount, saldo, (source, diff) => {
      if (source === 'ahorros') {
        const g = APP.savingGoals[0];
        if (g) addSavingMovement({ goalId: g.id, direction: 'retiro', amount: diff, date, notes: 'Para inversión' });
      }
      addInvestment({ name: desc, type, initialAmount: amount, date, notes, businessName: biz });
      showToast('Inversión registrada ✓', 'success');
      closeAddModal();
      refreshAll();
    });
    return;
  }
  addInvestment({ name: desc, type, initialAmount: amount, date, notes, businessName: biz });
  showToast('Inversión registrada ✓', 'success');
  closeAddModal();
  refreshAll();
}

function submitAhorro() {
  if (ahorroMode === 'nueva_meta') {
    const name = document.getElementById('f-goal-name')?.value?.trim();
    const type = document.getElementById('f-goal-type')?.value;
    const target = parseFloat(document.getElementById('f-goal-target')?.value) || 0;
    const date = document.getElementById('f-goal-date')?.value;
    const priority = document.getElementById('f-goal-priority')?.value;
    if (!name) { showToast('Ingresa un nombre para la meta', 'error'); return; }
    addSavingGoal({ name, type, targetAmount: target, targetDate: date, priority });
    showToast('Meta creada ✓', 'success');
    closeAddModal();
    refreshAll();
    return;
  }
  if (ahorroMode === 'deposito') {
    const goalId = document.getElementById('f-goal-id')?.value;
    const amount = parseFloat(document.getElementById('f-amount')?.value);
    const date = document.getElementById('f-date')?.value;
    const source = document.getElementById('f-source')?.value;
    const notes = document.getElementById('f-notes')?.value;
    if (!goalId) { showToast('Selecciona una meta de ahorro', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }
    if (source === 'saldo' && getCurrentSaldo() < amount) {
      showSaldoInsuficiente(amount, getCurrentSaldo(), (src) => {
        addSavingMovement({ goalId, direction: 'deposito', amount, date, notes, source });
        showToast('Depositado al ahorro ✓', 'success');
        closeAddModal();
        refreshAll();
      });
      return;
    }
    addSavingMovement({ goalId, direction: 'deposito', amount, date, notes, source });
    showToast('Depositado al ahorro ✓', 'success');
    closeAddModal();
    refreshAll();
    return;
  }
  if (ahorroMode === 'retiro') {
    const goalId = document.getElementById('f-goal-id-ret')?.value;
    const amount = parseFloat(document.getElementById('f-amount-ret')?.value);
    const date = document.getElementById('f-date-ret')?.value;
    const dest = document.getElementById('f-dest-ret')?.value;
    if (!goalId) { showToast('Selecciona una meta', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }
    const goal = APP.savingGoals.find(g => g.id === goalId);
    if (goal && amount > (goal.balance || 0)) { showToast('No tienes suficiente en esa meta', 'error'); return; }
    addSavingMovement({ goalId, direction: 'retiro', amount, date, notes: `Destino: ${dest}`, source: 'ahorro' });
    if (dest === 'saldo') {
      // Registrar como ingreso especial (no saludable)
      addTransaction({ type: 'ingreso', category: 'no_determinado', amount, date, description: 'Retiro de ahorro', notes: 'Transferencia desde ahorro', autoCategorized: true });
    }
    showToast('Retiro de ahorro registrado ✓', 'success');
    closeAddModal();
    refreshAll();
    return;
  }
}

function submitDeuda() {
  const name = document.getElementById('f-desc')?.value?.trim();
  const type = document.getElementById('f-category')?.value;
  const purpose = document.getElementById('f-purpose')?.value;
  const amount = parseFloat(document.getElementById('f-amount')?.value);
  const creditor = document.getElementById('f-creditor')?.value;
  const monthlyInt = parseFloat(document.getElementById('f-monthly-int')?.value) || 0;
  const term = parseInt(document.getElementById('f-term')?.value) || 12;
  const monthlyPay = parseFloat(document.getElementById('f-monthly-pay')?.value) || 0;
  const date = document.getElementById('f-date')?.value;
  const notes = document.getElementById('f-notes')?.value;

  if (!name) { showToast('Ingresa un nombre para la deuda', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Ingresa el monto de la deuda', 'error'); return; }

  const debt = addDebt({ type, name, purpose, totalAmount: amount, requestedAmount: amount, creditor, monthlyInterest: monthlyInt, termMonths: term, monthlyPayment: monthlyPay, startDate: date, notes });
  showToast('Deuda registrada ✓', 'success');
  closeAddModal();
  // Mostrar consejo
  setTimeout(() => showToast(getDebtAdvice(debt), 'info', 5000), 500);
  refreshAll();
}

function submitAzar() {
  const desc = document.getElementById('f-desc')?.value?.trim();
  const amount = parseFloat(document.getElementById('f-amount')?.value);
  const date = document.getElementById('f-date')?.value;
  const notes = document.getElementById('f-notes')?.value;

  if (!amount || amount <= 0) { showToast('Ingresa un monto válido', 'error'); return; }

  if (azarMode === 'gasto') {
    addTransaction({ type: 'gasto', category: 'azar_gasto', amount, date, description: desc || 'Apuesta', notes, autoCategorized: true });
    showToast('Gasto de azar registrado', 'success');
  } else {
    addTransaction({ type: 'ingreso', category: 'azar', amount, date, description: desc || 'Ganancia azar', notes, autoCategorized: true });
    showToast('Ganancia de azar registrada', 'success');
  }
  closeAddModal();
  refreshAll();
}

// =============================================
// PAGO DE DEUDA
// =============================================
function openPayDebt(debtId) {
  const debt = APP.debts.find(d => d.id === debtId);
  if (!debt) return;
  const monthlyInt = debt.monthlyInterest || 0;
  const interest = (debt.remainingBalance * monthlyInt / 100).toFixed(0);
  document.getElementById('add-modal-title').textContent = `Pagar: ${debt.name}`;
  document.getElementById('add-modal-body').innerHTML = `
    <div class="form-group">
      <label>Monto del pago (COP)</label>
      <input type="number" id="f-amount" value="${debt.monthlyPayment?.toFixed(0) || ''}" min="0" class="amount-big" />
    </div>
    <div class="form-group">
      <label>Interés incluido en el pago (COP)</label>
      <input type="number" id="f-interest" value="${interest}" min="0" />
    </div>
    <div class="form-group">
      <label>Origen del pago</label>
      <select id="f-source">
        <option value="saldo">Desde saldo disponible</option>
        <option value="ahorro">Desde ahorros</option>
      </select>
    </div>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="f-date" value="${todayStr()}" />
    </div>
    <div class="form-group">
      <label>Notas</label>
      <textarea id="f-notes"></textarea>
    </div>
    <p style="font-size:0.82rem;color:var(--text2);margin-bottom:12px;">Saldo pendiente: <strong>${fmtCOP(debt.remainingBalance)}</strong></p>
    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAddModal()">Cancelar</button>
      <button class="btn-primary" onclick="doPayDebt('${debtId}')"><i class="fas fa-check"></i> Registrar pago</button>
    </div>`;
  document.getElementById('add-modal').classList.remove('hidden');
}

function doPayDebt(debtId) {
  const amount = parseFloat(document.getElementById('f-amount')?.value);
  const interest = parseFloat(document.getElementById('f-interest')?.value) || 0;
  const source = document.getElementById('f-source')?.value;
  const date = document.getElementById('f-date')?.value;
  const notes = document.getElementById('f-notes')?.value;
  if (!amount || amount <= 0) { showToast('Ingresa el monto', 'error'); return; }

  if (source === 'ahorro') {
    const g = APP.savingGoals[0];
    if (g && g.balance >= amount) {
      addSavingMovement({ goalId: g.id, direction: 'retiro', amount, date, notes: `Pago deuda: ${APP.debts.find(d => d.id === debtId)?.name}` });
    }
  } else {
    // Registrar como gasto
    addTransaction({ type: 'gasto', category: 'no_det_gasto', amount, date, description: `Pago deuda: ${APP.debts.find(d => d.id === debtId)?.name}`, notes, autoCategorized: true });
  }

  payDebt(debtId, { amount, interest, date, source, notes });
  showToast('Pago registrado ✓', 'success');
  closeAddModal();
  refreshAll();
}

// =============================================
// SIDEBAR Y NAVEGACIÓN
// =============================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('active');
}

function closeSidebarOnMobile() {
  if (window.innerWidth < 900) {
    document.getElementById('sidebar').classList.remove('open');
    const ov = document.getElementById('sidebar-overlay');
    if (ov) ov.classList.remove('active');
  }
}

function navTo(page) {
  currentPage = page;
  // Ocultar todas
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-' + page)?.classList.remove('hidden');
  // Nav activo
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-page="${page}"]`)?.classList.add('active');
  document.querySelectorAll('.bnav-item').forEach(l => l.classList.remove('active'));
  document.querySelector(`.bnav-item[data-page="${page}"]`)?.classList.add('active');
  // Topbar title
  const titles = { dashboard: 'Dashboard', movimientos: 'Movimientos', ingresos: 'Ingresos', gastos: 'Gastos', inversiones: 'Inversiones', ahorros: 'Ahorros', deudas: 'Deudas', reportes: 'Reportes', azar: 'Juegos de Azar', perfil: 'Perfil' };
  const el = document.getElementById('topbar-title');
  if (el) el.textContent = titles[page] || page;
  closeSidebarOnMobile();
  renderPage(page);
}

// =============================================
// EDITAR / ELIMINAR TRANSACCIÓN
// =============================================
function editTx(id) {
  const tx = APP.transactions.find(t => t.id === id);
  if (!tx) return;
  openAddModal(tx.type, tx);
}

function deleteTx(id) {
  showConfirm('Eliminar movimiento', '¿Seguro que quieres eliminar este movimiento? El saldo se actualizará.', () => {
    deleteTransaction(id);
    showToast('Movimiento eliminado', 'success');
    refreshAll();
  });
}

// =============================================
// RENDER TRANSACCIÓN (ítem de lista)
// =============================================
function renderTxItem(tx) {
  const icon = getCategoryIcon(tx.category);
  const amtClass = tx.type;
  const sign = tx.type === 'ingreso' ? '+' : '-';
  return `
    <div class="tx-item" id="tx-${tx.id}">
      <div class="tx-icon ${tx.type}"><i class="fas ${icon}"></i></div>
      <div class="tx-info">
        <div class="tx-desc">${tx.description || getCategoryLabel(tx.category)}</div>
        <div class="tx-meta">
          <span class="tx-cat">${getCategoryLabel(tx.category)}</span>
          <span>${getTypeLabel(tx.type)}</span>
          ${tx.businessName ? `<span>📦 ${tx.businessName}</span>` : ''}
        </div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${amtClass}">${sign}${fmtCOP(tx.amount)}</div>
        <div class="tx-date">${fmtDate(tx.date)}</div>
      </div>
      <div class="tx-actions">
        <button class="tx-btn" onclick="editTx('${tx.id}')" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="tx-btn delete" onclick="deleteTx('${tx.id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
}

// =============================================
// FILTROS Y BÚSQUEDA
// =============================================
function filterMovs(filter, btn) {
  movFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderMovimientos();
}

// =============================================
// PERIODO DE REPORTE
// =============================================
function setPeriod(period, btn) {
  reportPeriod = period;
  document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderReportes();
}

// =============================================
// CAMBIO DE MES
// =============================================
function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  document.getElementById('month-display').textContent = getMonthShort(currentMonth, currentYear);
  document.getElementById('dash-month-label').textContent = getMonthLabel(currentMonth, currentYear);
  renderDashboard();
}

// =============================================
// TEMA
// =============================================
function toggleTheme() {
  const body = document.getElementById('app-body');
  const isDark = body.classList.contains('dark-theme');
  body.classList.toggle('dark-theme', !isDark);
  body.classList.toggle('light-theme', isDark);
  APP.theme = isDark ? 'light' : 'dark';
  saveDataCloud();
  const iconEl = document.getElementById('theme-icon');
  const iconMob = document.getElementById('theme-icon-mobile');
  const label = document.getElementById('theme-label');
  if (isDark) {
    if (iconEl) iconEl.className = 'fas fa-sun';
    if (iconMob) iconMob.className = 'fas fa-sun';
    if (label) label.textContent = 'Tema oscuro';
  } else {
    if (iconEl) iconEl.className = 'fas fa-moon';
    if (iconMob) iconMob.className = 'fas fa-moon';
    if (label) label.textContent = 'Tema claro';
  }
}
