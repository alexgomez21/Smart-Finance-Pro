/* =============================================
   CHARTS.JS - Gráficas con Chart.js
   Smart Finance Personal
   ============================================= */

'use strict';

// Destruir instancias previas
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

// Paleta de colores
const COLORS = {
  income: '#00c896',
  expense: '#ff5a7e',
  invest: '#ffc83a',
  saving: '#4ca3ff',
  debt: '#c77dff',
  palette: [
    '#4ca3ff', '#00c896', '#ff5a7e', '#ffc83a', '#c77dff',
    '#ff8c42', '#56cfad', '#f87171', '#a78bfa', '#38bdf8',
    '#fb923c', '#4ade80', '#facc15', '#c084fc', '#f472b6'
  ]
};

function getChartDefaults() {
  const isDark = document.body.classList.contains('dark-theme');
  return {
    gridColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    textColor: isDark ? '#a0a8c0' : '#6b7494',
    fontFamily: 'Inter'
  };
}

// ---- Gráfica semanal (ingresos vs gastos) ----
function renderWeeklyChart() {
  const canvas = document.getElementById('chart-weekly');
  if (!canvas) return;
  destroyChart('weekly');

  const { gridColor, textColor, fontFamily } = getChartDefaults();

  // Semanas del mes actual
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const weekInc = [0, 0, 0, 0];
  const weekExp = [0, 0, 0, 0];
  const weekInv = [0, 0, 0, 0];

  APP.transactions.forEach(tx => {
    const d = new Date(tx.date + 'T12:00:00');
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return;
    const day = d.getDate();
    const weekIdx = Math.min(3, Math.floor((day - 1) / 7));
    if (tx.type === 'ingreso') weekInc[weekIdx] += tx.amount;
    else if (tx.type === 'gasto') weekExp[weekIdx] += tx.amount;
    else if (tx.type === 'inversion') weekInv[weekIdx] += tx.amount;
  });

  chartInstances['weekly'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: weeks,
      datasets: [
        { label: 'Ingresos', data: weekInc, backgroundColor: COLORS.income + '99', borderColor: COLORS.income, borderWidth: 2, borderRadius: 6 },
        { label: 'Gastos', data: weekExp, backgroundColor: COLORS.expense + '99', borderColor: COLORS.expense, borderWidth: 2, borderRadius: 6 },
        { label: 'Inversiones', data: weekInv, backgroundColor: COLORS.invest + '99', borderColor: COLORS.invest, borderWidth: 2, borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: fontFamily, size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${fmtCOP(ctx.raw)}`
          }
        }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: fontFamily } } },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor, font: { family: fontFamily },
            callback: v => fmtCOP(v).replace('$', '$').substr(0, 8)
          }
        }
      }
    }
  });
}

// ---- Pastel gastos por categoría ----
function renderGastosPieChart() {
  const canvas = document.getElementById('chart-gastos-pie');
  if (!canvas) return;
  destroyChart('gastos-pie');
  const { textColor, fontFamily } = getChartDefaults();

  const gastos = txOfMonth(currentMonth, currentYear, 'gasto');
  const cats = {};
  gastos.forEach(tx => { cats[tx.category] = (cats[tx.category] || 0) + tx.amount; });
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sorted.length === 0) return;

  chartInstances['gastos-pie'] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: sorted.map(([k]) => getCategoryLabel(k)),
      datasets: [{ data: sorted.map(([, v]) => v), backgroundColor: COLORS.palette.slice(0, sorted.length), borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, font: { family: fontFamily, size: 10 }, boxWidth: 12 } },
        title: { display: true, text: 'Distribución de gastos', color: textColor, font: { family: fontFamily, size: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmtCOP(ctx.raw)}` } }
      }
    }
  });
}

// ---- Pastel ingresos por tipo ----
function renderIngresosPieChart() {
  const canvas = document.getElementById('chart-ingresos-pie');
  if (!canvas) return;
  destroyChart('ingresos-pie');
  const { textColor, fontFamily } = getChartDefaults();

  const ingresos = txOfMonth(currentMonth, currentYear, 'ingreso');
  const cats = {};
  ingresos.forEach(tx => { cats[tx.category] = (cats[tx.category] || 0) + tx.amount; });
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (sorted.length === 0) return;

  chartInstances['ingresos-pie'] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: sorted.map(([k]) => getCategoryLabel(k)),
      datasets: [{ data: sorted.map(([, v]) => v), backgroundColor: COLORS.palette.slice(2, 2 + sorted.length), borderWidth: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, font: { family: fontFamily, size: 10 }, boxWidth: 12 } },
        title: { display: true, text: 'Fuentes de ingresos', color: textColor, font: { family: fontFamily, size: 12 } },
        tooltip: { callbacks: { label: ctx => `${ctx.label}: ${fmtCOP(ctx.raw)}` } }
      }
    }
  });
}

// ---- Evolución mensual (últimos 6 meses) ----
function renderMonthlyChart() {
  const canvas = document.getElementById('chart-monthly');
  if (!canvas) return;
  destroyChart('monthly');
  const { gridColor, textColor, fontFamily } = getChartDefaults();

  const months = [];
  const incData = [], expData = [], invData = [], saldoData = [];

  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m < 0) { m += 12; y--; }
    months.push(getMonthShort(m, y));
    const inc = sumTx(txOfMonth(m, y, 'ingreso'));
    const exp = sumTx(txOfMonth(m, y, 'gasto'));
    const inv = sumTx(txOfMonth(m, y, 'inversion'));
    incData.push(inc);
    expData.push(exp);
    invData.push(inv);
    saldoData.push(inc - exp - inv);
  }

  chartInstances['monthly'] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Ingresos', data: incData, borderColor: COLORS.income, backgroundColor: COLORS.income + '22', fill: true, tension: 0.3, pointRadius: 4 },
        { label: 'Gastos', data: expData, borderColor: COLORS.expense, backgroundColor: COLORS.expense + '22', fill: true, tension: 0.3, pointRadius: 4 },
        { label: 'Inversiones', data: invData, borderColor: COLORS.invest, backgroundColor: COLORS.invest + '22', fill: false, tension: 0.3, pointRadius: 4 },
        { label: 'Flujo neto', data: saldoData, borderColor: COLORS.saving, backgroundColor: COLORS.saving + '22', fill: false, tension: 0.3, pointRadius: 4, borderDash: [5, 5] }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: fontFamily, size: 12 } } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmtCOP(ctx.raw)}` } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => fmtCOP(v).substr(0, 9) } }
      }
    }
  });
}

// ---- Gráfica tipo ingreso ----
function renderIncomeTypeChart() {
  const canvas = document.getElementById('chart-income-type');
  if (!canvas) return;
  destroyChart('income-type');
  const { textColor, fontFamily } = getChartDefaults();

  const cats = {};
  APP.transactions.filter(tx => tx.type === 'ingreso').forEach(tx => {
    cats[tx.category] = (cats[tx.category] || 0) + tx.amount;
  });
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (sorted.length === 0) return;

  chartInstances['income-type'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: sorted.map(([k]) => getCategoryLabel(k)),
      datasets: [{ label: 'Total', data: sorted.map(([, v]) => v), backgroundColor: COLORS.palette.slice(0, sorted.length), borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmtCOP(ctx.raw) } }
      },
      scales: {
        x: { ticks: { color: textColor, callback: v => fmtCOP(v).substr(0, 9) } },
        y: { ticks: { color: textColor, font: { size: 11 } } }
      }
    }
  });
}

// ---- Gráfica gastos por categoría (barra) ----
function renderExpenseCatChart() {
  const canvas = document.getElementById('chart-expense-cat');
  if (!canvas) return;
  destroyChart('expense-cat');
  const { textColor, fontFamily } = getChartDefaults();

  const cats = {};
  APP.transactions.filter(tx => tx.type === 'gasto').forEach(tx => {
    cats[tx.category] = (cats[tx.category] || 0) + tx.amount;
  });
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sorted.length === 0) return;

  chartInstances['expense-cat'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: sorted.map(([k]) => getCategoryLabel(k)),
      datasets: [{ label: 'Total', data: sorted.map(([, v]) => v), backgroundColor: COLORS.palette.slice(3, 3 + sorted.length), borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmtCOP(ctx.raw) } }
      },
      scales: {
        x: { ticks: { color: textColor, callback: v => fmtCOP(v).substr(0, 9) } },
        y: { ticks: { color: textColor, font: { size: 11 } } }
      }
    }
  });
}

// ---- Gráfica juegos de azar ----
function renderAzarChart() {
  const canvas = document.getElementById('chart-azar');
  if (!canvas) return;
  destroyChart('azar');
  const { gridColor, textColor } = getChartDefaults();

  const azarTx = APP.transactions.filter(tx => tx.category === 'azar_gasto' || tx.category === 'azar');
  if (azarTx.length === 0) return;

  // Agrupar por mes
  const monthMap = {};
  azarTx.forEach(tx => {
    const d = new Date(tx.date + 'T12:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) monthMap[key] = { gastado: 0, ganado: 0, label: getMonthShort(d.getMonth(), d.getFullYear()) };
    if (tx.category === 'azar_gasto') monthMap[key].gastado += tx.amount;
    else monthMap[key].ganado += tx.amount;
  });
  const sorted = Object.entries(monthMap).sort((a, b) => a[0].localeCompare(b[0]));

  chartInstances['azar'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: sorted.map(([, v]) => v.label),
      datasets: [
        { label: 'Gastado / Perdido', data: sorted.map(([, v]) => v.gastado), backgroundColor: COLORS.expense + '99', borderColor: COLORS.expense, borderWidth: 2, borderRadius: 6 },
        { label: 'Ganado', data: sorted.map(([, v]) => v.ganado), backgroundColor: COLORS.income + '99', borderColor: COLORS.income, borderWidth: 2, borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmtCOP(ctx.raw)}` } }
      },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => fmtCOP(v).substr(0, 8) } }
      }
    }
  });
}
