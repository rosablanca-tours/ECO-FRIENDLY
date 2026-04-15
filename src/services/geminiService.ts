import { GoogleGenAI, Type } from "@google/genai";
import { AssistantResponse, InputType } from "../types";
import { SIMULATED_ACCOMMODATIONS, COMMISSION_RATE, DONATION_RATE } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Eres el motor de la App "Ecofriendly", una plataforma de turismo sostenible en Venezuela.
Tu objetivo es procesar entradas de usuario ([TOUCH] o [VOICE]) y devolver una respuesta estructurada en JSON.

REGLAS DE NEGOCIO:
1. ROL: Eres el Motor de Experiencia del Visitante. Tu tono es inspirador, cercano y servicial.
2. ASESORÍA (PREMIUM): Si el usuario es Premium y pide "Planifica mi viaje", sugiere una ruta que maximice el ahorro de carbono y minimice el uso de plásticos.
3. MONETIZACIÓN: Calcula siempre un 10% de comisión por reserva. El 5% de esa comisión se destina a fundaciones ambientales (Fundación La Tortuga o Provita).
4. ECO-SCORE: Informa el Eco-Score del alojamiento. Si es menor a 7.0, advierte que está en "Periodo de Re-verificación".
5. FILTROS: Si el usuario menciona precio, energía, agua, ubicación, personas o tipo de impacto ([fauna], [energy], [indigenous]), extrae esos valores.
6. FORMATO DE RESPUESTA (JSON):
{
  "recognition": "Reconocimiento de la acción",
  "result": {
    "name": "Nombre del alojamiento",
    "location": "Ubicación",
    "ecoScore": 0.0
  },
  "filters": {
    "maxPrice": 0,
    "energy": "partial" | "full",
    "water": "advanced" | "closed",
    "location": "Nombre de la ciudad",
    "guests": 0,
    "minEcoScore": 0.0,
    "impactType": "fauna" | "energy" | "indigenous"
  },
  "impact": "Con esta reserva, donarás $[Monto] a la protección de [Proyecto].",
  "gamification": "Misión específica para ganar descuentos",
  "voice": "Pregunta abierta para guiar la navegación"
}
}

PROYECTOS DE DONACIÓN:
- Fundación La Tortuga (Protección marina)
- Provita (Conservación de biodiversidad)

BASE DE DATOS SIMULADA:
${JSON.stringify(SIMULATED_ACCOMMODATIONS)}

Si el usuario busca algo que no está, sugiere el más cercano o uno destacado.
Si el usuario es Premium, menciona beneficios exclusivos.
`;

export async function processUserIntent(input: string, type: InputType, isPremium: boolean = false): Promise<AssistantResponse> {
  const prompt = `[${type}] ${input}${isPremium ? ' [USER_IS_PREMIUM]' : ''}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recognition: { type: Type.STRING },
          result: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              location: { type: Type.STRING },
              ecoScore: { type: Type.NUMBER }
            },
            required: ["name", "location", "ecoScore"]
          },
          filters: {
            type: Type.OBJECT,
            properties: {
              maxPrice: { type: Type.NUMBER },
              energy: { type: Type.STRING, enum: ["partial", "full"] },
              water: { type: Type.STRING, enum: ["advanced", "closed"] },
              location: { type: Type.STRING },
              guests: { type: Type.NUMBER },
              minEcoScore: { type: Type.NUMBER },
              impactType: { type: Type.STRING, enum: ["fauna", "energy", "indigenous"] }
            }
          },
          impact: { type: Type.STRING },
          gamification: { type: Type.STRING },
          voice: { type: Type.STRING }
        },
        required: ["recognition", "result", "impact", "gamification", "voice"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
