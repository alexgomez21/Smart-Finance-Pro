/* =============================================
   AI.JS - FinIA: Chat con Gemini via Firebase Functions
   Smart Finance Pro - Colombia
   ============================================= */

// URLs de Firebase Functions — región us-central1 por defecto
const FINIA_CHAT_URL       = "https://geminichat-uc5e5o3xja-uc.a.run.app";
const FINIA_INDICATORS_URL = "https://updateindicadores-uc5e5o3xja-uc.a.run.app";

// Nota: después del primer deploy, Firebase te da las URLs exactas.
// Reemplaza las de arriba con las que te muestre la consola de Firebase.

let finiaMessages = [];
let finiaOpen = false;

// =============================================
// CONTEXTO FINANCIERO COMPLETO PARA GEMINI
// =============================================
function buildFinancialContext() {
  try {
    const p = APP.profile;
    const saldo       = calcSaldo();
    const totalAhorros = calcTotalAhorros();
    const totalDeuda  = calcTotalDeuda();
    const totalInv    = APP.investments.reduce((s, i) => s + (i.currentValue || 0), 0);
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    const ingresos   = sumTx(txOfMonth(m, y, 'ingreso'));
    const gastos     = sumTx(txOfMonth(m, y, 'gasto'));
    const inversiones = sumTx(txOfMonth(m, y, 'inversion'));
    const pctInv     = ingresos > 0 ? ((inversiones / ingresos) * 100).toFixed(1) : 0;
    const score      = calcScore();

    // Top gastos del mes por categoría
    const gastosArr = txOfMonth(m, y, 'gasto');
    const freq = {};
    gastosArr.forEach(tx => { freq[tx.category] = (freq[tx.category] || 0) + tx.amount; });
    const topGastos = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)
      .map(([cat,amt]) => `  - ${getCategoryLabel(cat)}: ${fmtCOP(amt)}`).join('\n');

    // Metas de ahorro
    const metas = APP.savingGoals.length > 0
      ? APP.savingGoals.map(g => `  - ${g.name}: ${fmtCOP(g.balance||0)} / ${fmtCOP(g.targetAmount||0)} (${g.targetAmount>0?((g.balance||0)/g.targetAmount*100).toFixed(0):0}%)`).join('\n')
      : '  - Ninguna registrada';

    // Deudas activas
    const deudas = APP.debts.filter(d => !d.paid);
    const deudasStr = deudas.length > 0
      ? deudas.map(d => `  - ${d.name}: ${fmtCOP(d.remainingBalance||d.totalAmount)} al ${d.interestRate}% E.A.`).join('\n')
      : '  - Ninguna activa';

    // Inversiones
    const invsStr = APP.investments.length > 0
      ? APP.investments.map(i => `  - ${i.name} (${getCategoryLabel(i.type)}): ${fmtCOP(i.currentValue||0)}`).join('\n')
      : '  - Ninguna registrada';

    return `
=== PERFIL ===
- Nombre: ${p.name || 'No especificado'}
- Ocupación: ${p.occupation || '—'} | Tipo: ${p.workType || '—'}
- Ciudad: ${p.city || 'Colombia'}
- Salario mensual declarado: ${fmtCOP(p.monthlySalary)}
- Personas en casa: ${p.peopleAtHome || 1} | Personas que sustenta: ${p.peopleSupport || 0}
- Vivienda: ${p.housing || '—'} | Pareja: ${p.hasPartner?'Sí':'No'} | Hijos: ${p.hasChildren?'Sí':'No'}

=== SITUACIÓN ACTUAL (${getMonthLabel(m, y)}) ===
- Saldo disponible: ${fmtCOP(saldo)}
- Ingresos del mes: ${fmtCOP(ingresos)}
- Gastos del mes: ${fmtCOP(gastos)}
- Inversiones del mes: ${fmtCOP(inversiones)} (${pctInv}% del ingreso)
- Total ahorros: ${fmtCOP(totalAhorros)}
- Total deudas: ${fmtCOP(totalDeuda)}
- Total inversiones (valor actual): ${fmtCOP(totalInv)}
- Puntaje financiero: ${score}/100

=== TOP GASTOS DEL MES ===
${topGastos || '  - Sin gastos registrados'}

=== METAS DE AHORRO ===
${metas}

=== DEUDAS ACTIVAS ===
${deudasStr}

=== INVERSIONES ===
${invsStr}

=== INDICADORES COLOMBIA ===
- Salario mínimo: ${fmtCOP(COLOMBIA.salarioMinimo)}
- Inflación anual: ${COLOMBIA.inflacionAnual}%
- Tasa de usura: ${COLOMBIA.tasaUsura}% E.A.
- Mejor CDT: ${COLOMBIA.mejorCDT}% E.A.
`.trim();
  } catch(e) {
    return 'No se pudo obtener el contexto financiero.';
  }
}

// =============================================
// ABRIR / CERRAR PANEL
// =============================================
window.toggleFinia = function() {
  finiaOpen = !finiaOpen;
  const panel = document.getElementById('finia-panel');
  const fab   = document.getElementById('finia-fab');
  if (finiaOpen) {
    panel.classList.remove('hidden');
    fab.classList.add('active');
    if (finiaMessages.length === 0) {
      const nombre = APP.profile.name ? `, ${APP.profile.name}` : '';
      addFiniaMessage('assistant',
        `¡Hola${nombre}! 👋 Soy **FinIA**, tu asesor financiero personal.\n\nYa tengo acceso a tus datos financieros reales. Puedo:\n- 📊 Analizar tu situación actual\n- 💡 Darte consejos personalizados para Colombia\n- ❓ Responder cualquier pregunta sobre tus finanzas\n\n¿En qué te ayudo hoy?`);
    }
    setTimeout(() => document.getElementById('finia-input')?.focus(), 100);
  } else {
    panel.classList.add('hidden');
    fab.classList.remove('active');
  }
};

window.closeFinia = function() {
  finiaOpen = false;
  document.getElementById('finia-panel')?.classList.add('hidden');
  document.getElementById('finia-fab')?.classList.remove('active');
};

// =============================================
// ENVIAR MENSAJE A GEMINI
// =============================================
window.sendFiniaMessage = async function() {
  const input = document.getElementById('finia-input');
  const text = input?.value?.trim();
  if (!text) return;
  input.value = '';
  input.disabled = true;

  addFiniaMessage('user', text);
  finiaMessages.push({ role: 'user', content: text });

  const typingId = showFiniaTyping();

  try {
    const response = await fetch(FINIA_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: finiaMessages,
        context: buildFinancialContext()
      })
    });

    const data = await response.json();
    removeFiniaTyping(typingId);

    if (data.reply) {
      finiaMessages.push({ role: 'assistant', content: data.reply });
      addFiniaMessage('assistant', data.reply);
    } else {
      addFiniaMessage('assistant', '❌ Sin respuesta del servidor. Intenta de nuevo.');
    }
  } catch(err) {
    removeFiniaTyping(typingId);
    addFiniaMessage('assistant', '❌ Error de conexión. Verifica tu internet e intenta de nuevo.');
    console.error('FinIA error:', err);
  }

  input.disabled = false;
  input.focus();
};

// =============================================
// SUGERENCIAS RÁPIDAS Y TECLADO
// =============================================
window.sendFiniaSuggestion = function(text) {
  const input = document.getElementById('finia-input');
  if (input) { input.value = text; }
  sendFiniaMessage();
};

window.finiaKeydown = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendFiniaMessage();
  }
};

// =============================================
// LIMPIAR CHAT
// =============================================
window.clearFiniaChat = function() {
  finiaMessages = [];
  const msgs = document.getElementById('finia-messages');
  if (msgs) msgs.innerHTML = '';
  addFiniaMessage('assistant', '¡Chat reiniciado! 🔄 ¿En qué te puedo ayudar?');
};

// =============================================
// ACTUALIZAR INDICADORES COLOMBIA
// =============================================
window.forceUpdateIndicators = async function() {
  const btn = document.getElementById('btn-update-indicators');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...'; }
  showToast('Consultando indicadores actualizados...', 'info');

  const now = new Date();
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  try {
    const response = await fetch(FINIA_INDICATORS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mes: meses[now.getMonth()],
        año: now.getFullYear()
      })
    });

    const result = await response.json();
    if (!result.ok || !result.data) throw new Error(result.error || 'Sin datos');

    const d = result.data;
    const updated = {
      salarioMinimo:     d.salarioMinimo,
      auxilioTransporte: d.auxilioTransporte || COLOMBIA.auxilioTransporte,
      salarioVital:      d.salarioMinimo + (d.auxilioTransporte || COLOMBIA.auxilioTransporte),
      inflacionAnual:    d.inflacionAnual,
      inflacionMensual:  d.inflacionMensual || COLOMBIA.inflacionMensual,
      interesBC:         d.interesBC || COLOMBIA.interesBC,
      tasaUsura:         d.tasaUsura || COLOMBIA.tasaUsura,
      mejorCDT:          d.mejorCDT || COLOMBIA.mejorCDT,
      canastaFamiliar:   d.canastaFamiliar || COLOMBIA.canastaFamiliar,
      mes:               d.mes || `${meses[now.getMonth()]} ${now.getFullYear()}`,
      fuente:            'DANE / Superfinanciera / Banrep',
      updatedAt:         `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`
    };

    Object.assign(COLOMBIA, updated);
    APP.economicRef = { ...updated };
    saveDataCloud();

    showToast(`✅ Indicadores de ${updated.mes} actualizados`, 'success');
    if (typeof renderPerfil === 'function') renderPerfil();
    if (typeof renderDashboard === 'function') renderDashboard();

  } catch(e) {
    console.error('Error actualizando indicadores:', e);
    showToast('No se pudieron actualizar. Intenta de nuevo.', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-rotate"></i> Actualizar'; }
  }
};

// =============================================
// HELPERS UI
// =============================================
function addFiniaMessage(role, text) {
  const msgs = document.getElementById('finia-messages');
  if (!msgs) return;

  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.+)/g, '<strong>$1</strong>')
    .replace(/## (.+)/g,  '<strong>$1</strong>')
    .replace(/^- (.+)/gm, '• $1')
    .replace(/\n/g, '<br>');

  const div = document.createElement('div');
  div.className = `finia-msg finia-msg-${role}`;
  div.innerHTML = `<div class="finia-bubble">${html}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showFiniaTyping() {
  const msgs = document.getElementById('finia-messages');
  if (!msgs) return null;
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'finia-msg finia-msg-assistant';
  div.id = id;
  div.innerHTML = `<div class="finia-bubble finia-typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

function removeFiniaTyping(id) {
  if (id) document.getElementById(id)?.remove();
}
