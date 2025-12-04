import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

// FIX: Use import.meta.env.VITE_API_KEY for Vite compatibility in production
// This assumes you have set VITE_API_KEY in Vercel Environment Variables
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "dummy_key_to_prevent_crash" });
const modelPro = 'gemini-3-pro-preview';
const modelProImage = 'gemini-3-pro-image-preview';

export const getFinancialTip = async (transactions: any[]): Promise<string> => {
  if (!API_KEY) {
    return "Configura tu VITE_API_KEY en Vercel para recibir consejos.";
  }
  
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
    console.error("Error fetching financial tip:", error);
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
  if (!API_KEY) throw new Error("VITE_API_KEY is not set.");
  
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `
    Analyze this receipt image. Extract items and prices. Return ONLY a JSON array like [{"name": "Item", "price": 10}]. Ignore totals/taxes.
  `;

  try {
    const response = await ai.models.generateContent({
        model: modelProImage,
        contents: { parts: [imagePart, { text: prompt }] },
    });
    
    let text = response.text ? response.text.trim() : "[]";
    if (text.startsWith('```json')) text = text.substring(7);
    if (text.endsWith('```')) text = text.slice(0, -3);
    
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw new Error("No se pudo leer el ticket.");
  }
};

export const findPromotions = async (items: string[]): Promise<string> => {
    if (!API_KEY) return "Configura VITE_API_KEY.";
    if (items.length === 0) return "Añade artículos para buscar ofertas.";

    const prompt = `Busca ofertas en Uruguay para: ${items.join(', ')}. Responde brevemente en español.`;
     try {
        const response = await ai.models.generateContent({ model: modelPro, contents: prompt });
        return response.text ? response.text.trim() : "";
    } catch (error) {
        return "No se pudieron buscar ofertas.";
    }
};

export const suggestCategory = async (description: string, categories: any[]): Promise<string> => {
   // Placeholder simple logic to prevent crash if AI fails
   return categories[0]?.id || '';
};