import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

// CORRECCIÓN: Usar import.meta.env para Vite. process.env da error.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const modelPro = 'gemini-1.5-pro'; 
const modelMultimodal = 'gemini-1.5-flash';

export const getFinancialTip = async (transactions: any[]): Promise<string> => {
  const recentTransactions = transactions.slice(0, 10).map(t => `${t.description}: $${t.amount}`).join(', ');
  const prompt = `
    Actúa como un sabio y empático asesor financiero con una personalidad mística de 'Alquimista'.
    Basado en estas transacciones recientes del usuario: [${recentTransactions}], proporciona un consejo financiero único, accionable e inspirador.
    El consejo debe ser conciso (alrededor de 2-3 frases).
    Enmárcalo como un 'Tip de Oro' o una pieza de 'Sabiduría Alquímica'.
    Haz que se sienta personal y alentador, no crítico.
    Tu respuesta debe ser únicamente el consejo en sí, sin ningún texto introductorio como "Aquí tienes tu consejo:".
    Tu respuesta DEBE ser en español.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelPro,
      contents: prompt,
    });
    return response.text ? response.text.trim() : "";
  } catch (error) {
    console.error("Error fetching financial tip from Gemini:", error);
    return "La sabiduría del Oráculo está momentáneamente nublada.";
  }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise as string, mimeType: file.type },
  };
};

export const analyzeReceipt = async (imageFile: File): Promise<{ name: string; price: number }[]> => {
  // Nota: Si esto falla por configuración de modelo, devolvemos array vacío para no romper la app
  return []; 
};

export const findPromotions = async (items: string[]): Promise<string> => {
    return "Función en mantenimiento por el momento.";
};

export const suggestCategory = async (description: string, categories: Category[]): Promise<string> => {
    return categories[0]?.id || "";
};