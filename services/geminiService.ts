import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const modelPro = 'gemini-3-pro-preview';

export const getFinancialTip = async (transactions: any[]): Promise<string> => {
  if (!API_KEY) {
    return "Configura tu VITE_API_KEY en Vercel para recibir consejos.";
  }
  
  const recentTransactions = transactions.slice(0, 10).map(t => `${t.description}: $${t.amount}`).join(', ');
  const prompt = `
    Actúa como un sabio y empático asesor financiero con una personalidad mística de 'Alquimista'.
    Basado en estas transacciones recientes: [${recentTransactions}], proporciona un consejo conciso (2-3 frases) y accionable.
    Enmárcalo como un 'Tip de Oro'.
    Debe ser en español.
  `;

  try {
    const response = await ai.models.generateContent({ model: modelPro, contents: prompt });
    return response.text ? response.text.trim() : "El Oráculo medita. Intenta más tarde.";
  } catch (error) {
    console.error("Error fetching financial tip from Gemini:", error);
    return "La sabiduría del Oráculo está momentáneamente nublada.";
  }
};
// ... (resto del archivo sin cambios)
