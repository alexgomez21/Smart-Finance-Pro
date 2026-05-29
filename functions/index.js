const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiApiKey = defineSecret("GEMINI_API_KEY");

// =============================================
// FUNCIÓN 1: Chat FinIA
// =============================================
exports.geminiChat = onRequest(
  { secrets: [geminiApiKey], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages requerido" });
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const systemPrompt = `Eres FinIA, un asesor financiero personal experto en finanzas colombianas.
Eres parte de la app "Smart Finance Pro". Respondes en español, de forma clara, empática y práctica.
Das consejos personalizados basados en los datos reales del usuario.
Nunca inventas datos — si no tienes información, lo dices claramente.
Siempre consideras el contexto económico colombiano: salario mínimo, inflación, tasa de usura, CDTs, etc.
Usa emojis ocasionalmente para hacer la conversación más amigable.

DATOS FINANCIEROS REALES DEL USUARIO:
${context || "No hay contexto disponible."}`;

      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({
        history,
        systemInstruction: systemPrompt,
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
      });

      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage(lastMessage);
      res.json({ reply: result.response.text() });

    } catch (err) {
      console.error("FinIA error:", err);
      res.status(500).json({ error: "Error al contactar Gemini: " + err.message });
    }
  }
);

// =============================================
// FUNCIÓN 2: Actualizar indicadores Colombia
// =============================================
exports.updateIndicadores = onRequest(
  { secrets: [geminiApiKey], cors: true },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { mes, año } = req.body;

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `Eres un experto en economía colombiana. Proporciona los indicadores económicos oficiales más recientes de Colombia para ${mes || "el mes actual"} ${año || new Date().getFullYear()}.

Usa las siguientes fuentes oficiales colombianas:
- DANE (dane.gov.co) para inflación y canasta familiar
- Banco de la República (banrep.gov.co) para tasa de interés
- Superfinanciera (superfinanciera.gov.co) para tasa de usura y mejores CDTs

Responde ÚNICAMENTE con un objeto JSON válido con exactamente estas claves numéricas (todos los valores deben ser números, no strings):
{
  "salarioMinimo": number,
  "auxilioTransporte": number,
  "inflacionAnual": number,
  "inflacionMensual": number,
  "interesBC": number,
  "tasaUsura": number,
  "mejorCDT": number,
  "canastaFamiliar": number,
  "mes": "string con el mes y año"
}

Si no tienes el dato exacto del mes solicitado, usa el dato más reciente disponible. No inventes datos.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch(e) {
        const match = text.match(/\{[\s\S]*?\}/);
        if (!match) throw new Error("No se pudo parsear JSON");
        data = JSON.parse(match[0]);
      }

      if (!data.salarioMinimo || !data.inflacionAnual) {
        throw new Error("Datos incompletos en la respuesta");
      }

      res.json({ ok: true, data });

    } catch (err) {
      console.error("Indicadores error:", err);
      res.status(500).json({ error: "Error al obtener indicadores: " + err.message });
    }
  }
);
