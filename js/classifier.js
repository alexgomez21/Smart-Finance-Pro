/* =============================================
   CLASSIFIER.JS - Clasificación automática
   Smart Finance Personal
   ============================================= */

'use strict';

// ---- Reglas base de clasificación por keywords ----
const CLASSIFICATION_RULES = {
  // GASTOS
  gasto: {
    alimentacion: ['agua', 'almuerzo', 'desayuno', 'cena', 'comida', 'mercado', 'tienda', 'frutas', 'verduras', 'pollo', 'carne', 'pan', 'leche', 'huevos', 'arroz', 'frijoles', 'lentejas', 'pasta', 'atún', 'jugo', 'gaseosa', 'snack', 'ensalada', 'sopa', 'sancocho', 'bandeja', 'corriente', 'arepa', 'café', 'tinto', 'merienda', 'lonchera', 'restaurante', 'd1', 'ara', 'carulla', 'éxito', 'jumbo', 'makro', 'olímpica', 'metro', 'ley', 'surtifamiliar'],
    gusticos: ['salchipapa', 'empanada', 'hamburguesa', 'hotdog', 'perro', 'pizza', 'sushi', 'helado', 'chocolate', 'gomitas', 'dulce', 'chicle', 'maíz', 'palomitas', 'chips', 'doritos', 'antojo', 'tentempié', 'paquete', 'brownie', 'galleta', 'oblea', 'buñuelo', 'pandebono', 'chocoramo', 'mango', 'picolé', 'frappy'],
    servicios: ['luz', 'agua servicio', 'gas', 'internet', 'telefono', 'celular', 'tv cable', 'claro', 'tigo', 'movistar', 'wom', 'virgilio', 'epm', 'codensa', 'acueducto', 'alcantarillado', 'streaming', 'netflix', 'spotify', 'disney', 'youtube', 'hbo', 'deezer', 'amazon prime'],
    entretenimiento: ['cine', 'teatro', 'concierto', 'billar', 'tejo', 'bolos', 'parque', 'museo', 'discoteca', 'bar', 'antro', 'rumba', 'parrandear', 'videojuego', 'xbox', 'playstation', 'nintendo', 'netflix fest'],
    gastos_malos: ['trago', 'licor', 'whisky', 'ron', 'aguardiente', 'cerveza', 'beer', 'cigarrillo', 'tabaco', 'cigar', 'vicio', 'alcohol', 'borracho', 'guaro', 'pola'],
    transporte: ['taxi', 'uber', 'bolt', 'cabify', 'bus', 'metro', 'transmilenio', 'sitp', 'moto taxi', 'pasaje', 'tiquete bus', 'jeep', 'flota', 'rappi moto'],
    salud: ['médico', 'doctor', 'farmacia', 'droguería', 'pastillas', 'medicamento', 'medicina', 'cita', 'consulta', 'examen', 'laboratorio', 'clínica', 'hospital', 'urgencias', 'droga', 'analgesico', 'antibiotico', 'cirugía', 'eps', 'copago'],
    seg_social: ['salud eps', 'pensión', 'arl', 'caja compensación', 'caja compensar', 'cafam', 'colpensiones', 'porvenir', 'protección', 'seguridad social'],
    vehiculo: ['gasolina', 'combustible', 'aceite', 'aceite carro', 'aceite moto', 'taller', 'repuesto', 'frenos', 'llantas', 'soat', 'seguro carro', 'lavadero', 'parqueadero', 'revisión técnico'],
    ropa: ['ropa', 'camisa', 'pantalón', 'zapato', 'tenis', 'zapatilla', 'vestido', 'falda', 'jean', 'blusa', 'chaqueta', 'abrigo', 'buzo', 'medias', 'ropa interior', 'calzado', 'tennis'],
    tecnologia: ['celular', 'computador', 'laptop', 'tablet', 'auricular', 'cargador', 'cable usb', 'memoria', 'disco duro', 'pendrive', 'cámara', 'smartwatch', 'televisor', 'samsung', 'apple', 'huawei', 'xiaomi'],
    educacion: ['matrícula', 'pensión escolar', 'universidad', 'colegio', 'instituto', 'academia', 'libro', 'cuaderno', 'útiles', 'materiales', 'internet educativo', 'plataforma', 'canvas', 'moodle'],
    belleza: ['peluquería', 'barbería', 'manicure', 'pedicure', 'depilación', 'estética', 'facial', 'masaje', 'spa', 'tinte', 'corte', 'uñas', 'cejas', 'maquillaje'],
    aseo_personal: ['shampoo', 'jabón', 'crema', 'desodorante', 'loción', 'colonia', 'perfume', 'pasta dental', 'cepillo', 'rasuradora', 'afeitado', 'toalla', 'papel higiénico', 'protector solar'],
    aseo_hogar: ['escoba', 'trapero', 'detergente', 'jabón loza', 'desinfectante', 'limpiador', 'ayudín', 'fabuloso', 'pinesol', 'tips', 'clorox', 'insecticida', 'limpión'],
    mascotas: ['veterinario', 'vacuna perro', 'vacuna gato', 'comida perro', 'comida gato', 'collar', 'correa', 'juguete mascota', 'peluquería mascotas', 'paseador'],
    viaje: ['hotel', 'hospedaje', 'hostal', 'airbnb', 'vuelo', 'tiquete aéreo', 'pasaje aéreo', 'avianca', 'latam', 'wingo', 'vivacolombia', 'paseo', 'turismo', 'excursión'],
    deporte: ['gym', 'gimnasio', 'piscina', 'entrenador', 'fitness', 'yoga', 'crossfit', 'fútbol', 'natación', 'tenis', 'ciclismo', 'running', 'deporte'],
    azar_gasto: ['lotería', 'chance', 'apuesta', 'casino', 'bingo', 'raspadito', 'tragamonedas', 'poker', 'ruleta', 'betplay', 'codere', 'jugué'],
    regalos: ['regalo', 'obsequio', 'detalle', 'flores', 'chocolatinas regalo', 'tarjeta regalo'],
    impuestos: ['predial', 'valorización', 'impuesto', 'tasa', 'multa', 'infracción', 'declaración renta', 'retención'],
    hogar: ['arriendo', 'administración', 'cuota administración', 'mercado hogar', 'mantenimiento hogar'],
    reparacion: ['reparación', 'plomero', 'electricista', 'técnico', 'mantenimiento', 'pintura', 'soldadura', 'construcción', 'finca raíz reparación'],
    pareja: ['cena romántica', 'plan pareja', 'regalo novia', 'regalo novio', 'salida pareja'],
    hijos: ['pañales', 'leche fórmula', 'juguete', 'uniforme', 'útiles escolares', 'guardería', 'jardín', 'colonia'],
    perdida: ['perdí', 'se perdió', 'extravié', 'me perdieron', 'perdida'],
    robo: ['robo', 'me robaron', 'atraco', 'hurto', 'raponero']
  },
  // INGRESOS
  ingreso: {
    salario: ['salario', 'sueldo', 'nomina', 'nómina', 'quincena', 'pago empresa', 'pago mensual'],
    extras_comisiones: ['comision', 'comisión', 'horas extra', 'extra', 'bono', 'bonificación', 'incentivo'],
    trabajo_ocasional: ['trabajo ocasional', 'rebusque', 'jornal', 'servicio prestado', 'contrato', 'freelance'],
    regalo: ['regalo recibido', 'me regalaron', 'recibí regalo'],
    venta: ['vendí', 'venta', 'cobré', 'vendedor'],
    rendimiento_cdt: ['cdt', 'rendimiento', 'bolsillo', 'alcancía', 'bancolombia ahorro', 'nequi rendimiento', 'daviplata rendimiento'],
    dividendo_bolsa: ['dividendo', 'bolsa', 'acciones', 'inversión bolsa', 'portafolio'],
    viaticos: ['viáticos', 'viaticos', 'reembolso', 'gastos viaje empresa'],
    azar: ['gané lotería', 'gané chance', 'gané casino', 'premio', 'raspadito ganador'],
    pension: ['pensión', 'pensionado', 'jubilación'],
    negocio: ['negocio', 'ventas negocio', 'local', 'tienda'],
    otro_trabajo: ['trabajo', 'empleo', 'labor', 'oficios'],
    encontre_plata: ['encontré plata', 'encontré', 'hallé'],
    prestamo_recibido: ['me prestaron', 'préstamo', 'crédito desembolsado', 'plata prestada']
  }
};

// ---- Clasificar un texto ----
function classifyTransaction(description, type) {
  if (!description) return null;
  const desc = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Primero: reglas aprendidas del usuario
  if (APP && APP.learnedRules) {
    const userRule = APP.learnedRules[desc.trim()];
    if (userRule) return userRule;

    // Buscar coincidencia parcial en reglas aprendidas
    for (const [key, cat] of Object.entries(APP.learnedRules)) {
      if (desc.includes(key) || key.includes(desc)) return cat;
    }
  }

  // Luego: reglas base
  const rules = CLASSIFICATION_RULES[type] || CLASSIFICATION_RULES.gasto;
  for (const [cat, keywords] of Object.entries(rules)) {
    for (const kw of keywords) {
      if (desc.includes(kw)) return cat;
    }
  }

  return null;
}

// ---- Aprender regla del usuario ----
function learnRule(description, category) {
  if (!description || !category) return;
  const key = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (!APP.learnedRules) APP.learnedRules = {};
  APP.learnedRules[key] = category;
  saveData();
}

// ---- Obtener sugerencias (top 3) ----
function getSuggestions(description, type) {
  if (!description) return [];
  const desc = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const rules = CLASSIFICATION_RULES[type] || CLASSIFICATION_RULES.gasto;
  const scores = {};
  for (const [cat, keywords] of Object.entries(rules)) {
    scores[cat] = 0;
    for (const kw of keywords) {
      if (desc.includes(kw)) scores[cat] += kw.length; // más largo = más específico
    }
  }
  return Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);
}

// ---- Detectar si es gasto de riesgo ----
function isRiskCategory(cat) {
  const riskCats = ['gastos_malos', 'gusticos', 'entretenimiento', 'azar_gasto'];
  return riskCats.includes(cat);
}

// ---- Detectar si es "gasto malo" ----
function isBadCategory(cat) {
  return cat === 'gastos_malos';
}
