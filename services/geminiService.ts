import { GoogleGenAI } from "@google/genai";
import type { TransmutationList } from "../types"; // Using a valid type

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const modelPro = 'gemini-3-pro-preview';
const modelProImage = 'gemini-3-pro-image-preview';

export const getFinancialTip = async (transactions: any[]): Promise<string> => {
  if (!API_KEY) {
    return "Configura tu VITE_API_KEY en Vercel para recibir consejos.";
  }
  
  const recentTransactions = transactions.slice(0, 10).map(t => `${t.description}: $${t.amount}`).join(', ');
  const prompt = `
    Actúa como un sabio asesor financiero 'Alquimista'.
    Basado en estas transacciones: [${recentTransactions}], da un consejo conciso (2-3 frases) y accionable en español.
    Enmárcalo como un 'Tip de Oro'.
  `;

  try {
    const response = await ai.models.generateContent({ model: modelPro, contents: prompt });
    return response.text ? response.text.trim() : "El Oráculo medita.";
  } catch (error) {
    console.error("Error fetching financial tip from Gemini:", error);
    return "La sabiduría del Oráculo está nublada.";
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
    Analyze the receipt. Extract item names and prices.
    Return a valid JSON array: [{"name": "Item Name", "price": 12.34}].
    Only include the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
        model: modelProImage,
        contents: { parts: [imagePart, { text: prompt }] },
    });
    
    let textResponse = response.text ? response.text.trim() : "[]";
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.substring(7, textResponse.length - 3);
    }

    const parsed = JSON.parse(textResponse);
    return Array.isArray(parsed) ? parsed.filter(item => typeof item.name === 'string' && typeof item.price === 'number') : [];
  } catch (error) {
    console.error("Error analyzing receipt with Gemini:", error);
    throw new Error("No se pudo interpretar el ticket.");
  }
};

export const findPromotions = async (items: string[]): Promise<string> => {
    if (!API_KEY) return "La búsqueda de ofertas requiere una VITE_API_KEY.";
    if (items.length === 0) return "Añade artículos para buscar ofertas."

    const itemList = items.join(', ');
    const prompt = `
        Actúa como un asistente de compras para un usuario en Uruguay.
        Dada la lista: [${itemList}].
        Busca ofertas en supermercados uruguayos y con tarjetas de crédito.
        Presenta un resumen breve (2-3 hallazgos) en español.
    `;

     try {
        const response = await ai.models.generateContent({ model: modelPro, contents: prompt });
        return response.text ? response.text.trim() : "No se encontraron ofertas.";
    } catch (error) {
        console.error("Error fetching promotions from Gemini:", error);
        return "No se pudieron buscar ofertas.";
    }
};
