# 💰 Smart Finance Personal

App web de finanzas personales para Colombia — responsive, funcional y con análisis inteligente.

## ✅ Funcionalidades completadas

### Onboarding
- Perfil financiero de 5 pasos: identidad, entorno de vida, ingresos, metas, deudas
- Creación automática de meta de ahorro y registro del salario inicial desde el onboarding

### Dashboard
- Tarjetas de resumen mensual: ingresos, gastos, inversiones, saldo, ahorro, deuda activa
- Estado financiero en tiempo real: Excelente / Bien / Mal / Grave (con puntuación 0–100)
- Indicadores económicos Colombia 2026 embebidos (salario mínimo, inflación, usura, CDT)
- Comparativas automáticas: salario vs mínimo, inversión vs inflación, deuda vs usura
- Alertas y consejos inteligentes personalizados
- Últimos movimientos con categoría visual
- Navegación de mes (anterior/siguiente)
- Gráfica barras semanal: ingresos vs gastos vs inversiones
- Gráficas de pastel: distribución de gastos e ingresos

### Ingresos (19 tipos)
- Salario, comisiones, trabajo ocasional, regalo, venta, novio, sugar, rendimiento CDT, dividendo bolsa, viáticos, azar, encontré plata, préstamo recibido (crea deuda), pensión, negocio, inversión, otro

### Gastos (33 tipos)
- Clasificación automática por descripción: escribe "agua 1000" y categoriza en alimentación
- Aprendizaje de correcciones del usuario (learnedRules)
- Subtipos para vehículo: gasolina, aceite, repuestos, parqueadero, etc.
- Alertas cuando gusticos + entretenimiento + gastos malos > 30%

### Inversiones
- 10 tipos: proyecto, prestar con interés, cursos, bolsa, activo productivo, materiales, lote, negocio, CDT, otro
- ROI calculado vs inflación
- Registro de movimientos: aporte, retiro, rendimiento

### Ahorros
- Metas con nombre, monto objetivo, fecha y prioridad
- Progreso visual con barra y porcentaje
- Estimación automática de tiempo restante (ETA)
- Depósito y retiro desde metas (no registra como gasto ni como ingreso)

### Deudas
- 9 tipos: hipotecario, cuota a cuota, Addi, tarjeta, crédito bancario, vehicular, vivienda, emergencia, amigo
- Cálculo de tasa anual equivalente E.A. desde tasa mensual
- Alertas si supera tasa de usura (26,76% E.A.)
- Pago de cuotas con separación capital / interés
- Consejo automático por nivel de riesgo

### Movimientos
- Lista completa con filtros: todos, ingresos, gastos, inversiones, ahorros, deudas
- Búsqueda por texto
- Editar / Eliminar con recálculo automático de saldo

### Reportes
- Evolución mensual (últimos 6 meses): ingresos, gastos, inversiones, flujo neto
- Gráfica de ingresos por tipo
- Gráfica de gastos por categoría (barras horizontales)
- Análisis inteligente textual del periodo

### Juegos de Azar
- Módulo independiente con registro de apuestas y ganancias
- Balance neto total
- Gráfica histórica gastado vs ganado
- Consejo adaptado según resultado (gana, pierde, equilibrado)

### Tema
- Oscuro (por defecto) y claro con toggle persistente

### Importar / Exportar
- Exporta todos los datos en `.json`
- Importa y restaura desde `.json`

### Motor de saldo coherente
- El saldo solo se afecta por ingresos, gastos e inversiones
- Ahorros no cuentan como gastos (son transferencias)
- Pago de deuda desde saldo o ahorro
- Si el saldo es insuficiente, aparece modal con opciones: usar ahorro, crear deuda, registrar ingreso

## 📁 Estructura de archivos

```
index.html          → Estructura principal + modales + navegación
css/
  style.css         → Tema oscuro/claro + responsive + componentes
js/
  data.js           → Constantes, tipos, estructura de datos, LocalStorage, helpers
  classifier.js     → Clasificación automática por palabras clave + aprendizaje
  engine.js         → Lógica: transacciones, ahorros, inversiones, deudas, análisis
  ui.js             → Formularios, modales, renders de ítems, navegación, tema
  charts.js         → Gráficas Chart.js: semanal, pie, mensual, tipos, azar
  demo.js           → Datos de ejemplo para primera visita
  app.js            → Inicialización, onboarding, render de cada página
```

## 📊 Indicadores Colombia usados (Abr 2026)

| Indicador | Valor |
|---|---|
| Salario mínimo | $1.750.905 |
| Auxilio de transporte | $249.095 |
| Salario vital | $2.000.000 |
| Inflación anual IPC | 5,56% |
| Inflación mensual | 0,78% |
| Interés bancario corriente | 17,84% E.A. |
| Tasa de usura | 26,76% E.A. |
| Mejor CDT | 13,3% E.A. |

Fuentes: DANE, Superfinanciera, Presidencia Colombia.

## 🔜 Posibles mejoras futuras

- Notificaciones / recordatorios de pagos
- Simulador: "si prepago esta deuda, cuánto ahorro en interés"
- Simulador: "si ahorro X al mes, cuándo llego a la meta"
- Reconocimiento de comercios por nombre
- Exportar reportes en PDF
- Sincronización en la nube
- Múltiples usuarios / perfiles
- Modo offline completo (PWA con service worker)
- Comparación con amigos o promedios nacionales

## 🚀 Despliegue

Para publicar, usa la pestaña **Publish** del editor — tu app estará disponible en línea con un clic.
