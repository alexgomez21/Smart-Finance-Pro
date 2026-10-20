/* =============================================
   AI.JS - FinIA: Asistente financiero con OpenRouter
   Smart Finance Pro - Colombia
   ============================================= */

const OPENROUTER_API_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "deepseek/deepseek-chat:free";

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
    const gastosArr   = txOfMonth(m, y, 'gasto');
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
- Mejor CDT: ${COLOMBIA.mejorCDT}% E.A.`.trim();
  } catch(e) { return 'No se pudo obtener el contexto financiero.'; }
}

async function callAI(userMessage) {
  const messages = [
    { 
      role: 'system', 
      content: `Eres FinIA, asesor financiero personal experto en finanzas colombianas en la app Smart Finance Pro. Tienes acceso a los datos financieros reales del usuario. Responde en español, de forma clara, empática y práctica. Usa pesos colombianos. Sé conciso pero útil. Usa emojis ocasionalmente.\n\nDATOS FINANCIEROS REALES:\n${buildFinancialContext()}` 
    },
    ...finiaMessages.slice(-10),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost',
      'X-Title': 'Smart Finance Pro',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: messages
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error en la conexión');
  return data.choices?.[0]?.message?.content || 'Sin respuesta';
}

window.toggleFinia = function() {
  finiaOpen = !finiaOpen;
  const panel = document.getElementById('finia-panel');
  const fab   = document.getElementById('finia-fab');
  if (finiaOpen) {
    panel.classList.remove('hidden'); fab.classList.add('active');
    if (finiaMessages.length === 0) {
      const nombre = APP.profile.name ? `, ${APP.profile.name}` : '';
      addFiniaMessage('assistant', `¡Hola${nombre}! 👋 Soy **FinIA**, tu asesor financiero con IA.\n\nTengo acceso a tus datos financieros reales. Puedo:\n- 📊 Analizar tu situación financiera\n- 💡 Darte consejos para Colombia\n- ❓ Responder tus preguntas\n\n¿En qué te ayudo hoy?`);
    }
    setTimeout(() => document.getElementById('finia-input')?.focus(), 100);
  } else {
    panel.classList.add('hidden'); fab.classList.remove('active');
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

  if (!OPENROUTER_API_KEY) {
    addFiniaMessage('assistant', '⚠️ Falta configurar la API key de OpenRouter en el archivo ai.js');
    return;
  }

  input.value = ''; input.disabled = true;
  addFiniaMessage('user', text);
  const typingId = showFiniaTyping();

  try {
    const reply = await callAI(text);
    removeFiniaTyping(typingId);
    finiaMessages.push({ role: 'user', content: text });
    finiaMessages.push({ role: 'assistant', content: reply });
    addFiniaMessage('assistant', reply);
  } catch(err) {
    removeFiniaTyping(typingId);
    addFiniaMessage('assistant', '❌ Error de conexión. Verifica tu clave o internet.');
    console.error('FinIA error:', err);
  }

  input.disabled = false; input.focus();
};

window.sendFiniaSuggestion = function(text) {
  const input = document.getElementById('finia-input');
  if (input) input.value = text;
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
