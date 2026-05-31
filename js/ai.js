/* =============================================
   AI.JS - FinIA: Asistente financiero con Groq
   Smart Finance Pro - Colombia
   =============================================
   Reemplaza TU_GROQ_KEY_AQUI con tu key de
   console.groq.com (empieza por gsk_...)
   ============================================= */

const GROQ_API_KEY = "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";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

let finiaMessages = [];
let finiaOpen = false;

function buildFinancialContext() {
  try {
    const p = APP.profile;
    const saldo        = calcSaldo();
    const totalAhorros = calcTotalAhorros();
    const totalDeuda   = calcTotalDeuda();
    const totalInv     = APP.investments.reduce((s, i) => s + (i.currentValue || 0), 0);
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    const ingresos    = sumTx(txOfMonth(m, y, 'ingreso'));
    const gastos      = sumTx(txOfMonth(m, y, 'gasto'));
    const inversiones = sumTx(txOfMonth(m, y, 'inversion'));
    const pctInv      = ingresos > 0 ? ((inversiones / ingresos) * 100).toFixed(1) : 0;
    const score       = calcScore();

    const gastosArr = txOfMonth(m, y, 'gasto');
    const freq = {};
    gastosArr.forEach(tx => { freq[tx.category] = (freq[tx.category] || 0) + tx.amount; });
    const topGastos = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)
      .map(([cat,amt]) => `  - ${getCategoryLabel(cat)}: ${fmtCOP(amt)}`).join('\n');

    const metas = APP.savingGoals.length > 0
      ? APP.savingGoals.map(g => `  - ${g.name}: ${fmtCOP(g.balance||0)} / ${fmtCOP(g.targetAmount||0)} (${g.targetAmount>0?((g.balance||0)/g.targetAmount*100).toFixed(0):0}%)`).join('\n')
      : '  - Ninguna registrada';

    const deudas = APP.debts.filter(d => !d.paid);
    const deudasStr = deudas.length > 0
      ? deudas.map(d => `  - ${d.name}: ${fmtCOP(d.remainingBalance||d.totalAmount)} al ${d.interestRate}% E.A.`).join('\n')
      : '  - Ninguna activa';

    const invsStr = APP.investments.length > 0
      ? APP.investments.map(i => `  - ${i.name} (${getCategoryLabel(i.type)}): ${fmtCOP(i.currentValue||0)}`).join('\n')
      : '  - Ninguna registrada';

    return `
=== PERFIL ===
- Nombre: ${p.name || 'No especificado'}
- Ocupación: ${p.occupation || '—'} | Tipo: ${p.workType || '—'}
- Ciudad: ${p.city || 'Colombia'}
- Salario mensual: ${fmtCOP(p.monthlySalary)}
- Personas en casa: ${p.peopleAtHome || 1} | Sustenta: ${p.peopleSupport || 0}
- Vivienda: ${p.housing || '—'} | Pareja: ${p.hasPartner?'Sí':'No'} | Hijos: ${p.hasChildren?'Sí':'No'}

=== SITUACIÓN ACTUAL (${getMonthLabel(m, y)}) ===
- Saldo disponible: ${fmtCOP(saldo)}
- Ingresos del mes: ${fmtCOP(ingresos)}
- Gastos del mes: ${fmtCOP(gastos)}
- Inversiones del mes: ${fmtCOP(inversiones)} (${pctInv}% del ingreso)
- Total ahorros: ${fmtCOP(totalAhorros)}
- Total deudas: ${fmtCOP(totalDeuda)}
- Total inversiones: ${fmtCOP(totalInv)}
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

async function callGroq(userMessage) {
  const systemPrompt = `Eres FinIA, un asesor financiero personal experto en finanzas colombianas integrado en la app Smart Finance Pro.
Tienes acceso a los datos financieros reales del usuario.
Responde siempre en español, de forma clara, empática y práctica.
Usa cifras en pesos colombianos. Sé conciso pero útil. Usa emojis ocasionalmente.
Considera siempre el contexto económico colombiano.

DATOS FINANCIEROS REALES DEL USUARIO:
${buildFinancialContext()}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...finiaMessages.slice(-10),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({ model: GROQ_MODEL, messages, max_tokens: 800, temperature: 0.7 })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error Groq');
  return data.choices?.[0]?.message?.content || 'Sin respuesta';
}

window.forceUpdateIndicators = async function() {
  const btn = document.getElementById('btn-update-indicators');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...'; }
  showToast('Consultando indicadores actualizados...', 'info');

  const now = new Date();
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const mes = meses[now.getMonth()];
  const año = now.getFullYear();

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'Eres experto en economía colombiana. Responde SOLO con JSON válido, sin texto adicional, sin backticks.' },
          { role: 'user', content: `Indicadores económicos Colombia ${mes} ${año}. Formato exacto: {"salarioMinimo":number,"auxilioTransporte":number,"inflacionAnual":number,"inflacionMensual":number,"interesBC":number,"tasaUsura":number,"mejorCDT":number,"canastaFamiliar":number,"mes":"${mes} ${año}"}` }
        ],
        max_tokens: 300, temperature: 0.1
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Error Groq');
    const text = data.choices?.[0]?.message?.content || '';
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error('No JSON');
    const d = JSON.parse(match[0]);
    if (!d.salarioMinimo) throw new Error('Datos incompletos');

    const updated = {
      salarioMinimo: d.salarioMinimo, auxilioTransporte: d.auxilioTransporte || COLOMBIA.auxilioTransporte,
      salarioVital: d.salarioMinimo + (d.auxilioTransporte || COLOMBIA.auxilioTransporte),
      inflacionAnual: d.inflacionAnual, inflacionMensual: d.inflacionMensual || COLOMBIA.inflacionMensual,
      interesBC: d.interesBC || COLOMBIA.interesBC, tasaUsura: d.tasaUsura || COLOMBIA.tasaUsura,
      mejorCDT: d.mejorCDT || COLOMBIA.mejorCDT, canastaFamiliar: d.canastaFamiliar || COLOMBIA.canastaFamiliar,
      mes: d.mes || `${mes} ${año}`, fuente: 'DANE / Superfinanciera / Banrep',
      updatedAt: `${año}-${String(now.getMonth()+1).padStart(2,'0')}-01`
    };

    Object.assign(COLOMBIA, updated);
    APP.economicRef = { ...updated };
    saveDataCloud();
    showToast(`✅ Indicadores de ${updated.mes} actualizados`, 'success');
    if (typeof renderPerfil === 'function') renderPerfil();
    if (typeof renderDashboard === 'function') renderDashboard();

  } catch(e) {
    console.error('Error indicadores:', e);
    showToast('No se pudieron actualizar. Intenta de nuevo.', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-rotate"></i> Actualizar'; }
  }
};

window.toggleFinia = function() {
  finiaOpen = !finiaOpen;
  const panel = document.getElementById('finia-panel');
  const fab   = document.getElementById('finia-fab');
  if (finiaOpen) {
    panel.classList.remove('hidden');
    fab.classList.add('active');
    if (finiaMessages.length === 0) {
      const nombre = APP.profile.name ? `, ${APP.profile.name}` : '';
      addFiniaMessage('assistant', `¡Hola${nombre}! 👋 Soy **FinIA**, tu asesor financiero personal con IA.\n\nYa tengo acceso a tus datos financieros reales. Puedo:\n- 📊 Analizar tu situación financiera\n- 💡 Darte consejos personalizados para Colombia\n- ❓ Responder tus preguntas sobre finanzas\n\n¿En qué te ayudo hoy?`);
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

window.sendFiniaMessage = async function() {
  const input = document.getElementById('finia-input');
  const text = input?.value?.trim();
  if (!text) return;
  if (GROQ_API_KEY === 'TU_GROQ_KEY_AQUI') {
    addFiniaMessage('assistant', '⚠️ Falta configurar la API key de Groq en el archivo ai.js');
    return;
  }
  input.value = '';
  input.disabled = true;
  addFiniaMessage('user', text);
  const typingId = showFiniaTyping();
  try {
    const reply = await callGroq(text);
    removeFiniaTyping(typingId);
    finiaMessages.push({ role: 'user', content: text });
    finiaMessages.push({ role: 'assistant', content: reply });
    addFiniaMessage('assistant', reply);
  } catch(err) {
    removeFiniaTyping(typingId);
    addFiniaMessage('assistant', '❌ Error de conexión. Verifica tu internet e intenta de nuevo.');
    console.error('FinIA error:', err);
  }
  input.disabled = false;
  input.focus();
};

window.sendFiniaSuggestion = function(text) {
  const input = document.getElementById('finia-input');
  if (input) { input.value = text; }
  sendFiniaMessage();
};

window.finiaKeydown = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFiniaMessage(); }
};

window.clearFiniaChat = function() {
  finiaMessages = [];
  const msgs = document.getElementById('finia-messages');
  if (msgs) msgs.innerHTML = '';
  addFiniaMessage('assistant', '¡Chat reiniciado! 🔄 ¿En qué te puedo ayudar?');
};

function addFiniaMessage(role, text) {
  const msgs = document.getElementById('finia-messages');
  if (!msgs) return;
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.+)/g, '<strong>$1</strong>')
    .replace(/## (.+)/g, '<strong>$1</strong>')
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
