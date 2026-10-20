// =============================================
// AI.JS - FinIA: Asistente financiero con Gemini
// Smart Finance Pro - Colombia
// =============================================

const GEMINI_API_KEY = "AQ.Ab8RN6IBVyu7uoNQEoKNpFQEqW99nz_0dySfbud1N8z7Yn1DuA"; // Pega aquí tu clave que empieza por AIza...
const GEMINI_MODEL = "gemini-2.5-flash"; // Modelo rápido y eficiente para chat
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;async function callGemini(userMessage) {
  // Convertimos el historial de mensajes al formato que exige Gemini (contents)
  const contents = [];
  
  // Añadimos el mensaje del sistema (contexto financiero + rol) como primer mensaje o instrucción
  const systemInstruction = `Eres FinIA, asesor financiero personal experto en finanzas colombianas en la app Smart Finance Pro. Tienes acceso a los datos financieros reales del usuario. Responde en español, de forma clara, empática y práctica. Usa pesos colombianos. Sé conciso pero útil. Usa emojis ocasionalmente.\n\nDATOS FINANCIEROS REALES:\n${buildFinancialContext()}`;
  
  contents.push({
    role: "user",
    parts: [{ text: systemInstruction }, { text: "Entendido, comencemos." }]
  });
  contents.push({
    role: "model",
    parts: [{ text: "¡Claro! Estoy listo para ayudarte con tus finanzas personales según tus datos reales." }]
  });

  // Añadimos el historial previo (últimos 10 mensajes)
  finiaMessages.slice(-10).forEach(msg => {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  });

  // Añadimos el mensaje actual del usuario
  contents.push({
    role: "user",
    parts: [{ text: userMessage }]
  });

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error al conectar con Gemini');
  
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
}
