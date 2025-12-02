import { GoogleGenAI } from "@google/genai";
import { Category } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, API_KEY should be set.
  console.warn("API_KEY is not set. Using a placeholder. AI features will not work.");
}

// FIX: Removed placeholder fallback for API Key to adhere to security and environment-based configuration best practices.
const ai = new GoogleGenAI({ apiKey: API_KEY });
const modelPro = 'gemini-3-pro-preview';
const modelProImage = 'gemini-3-pro-image-preview';

export const getFinancialTip = async (transactions: any[]): Promise<string> => {
  if (!API_KEY) {
    return "Configura tu API Key de Gemini para recibir consejos personalizados.";
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
    Ejemplo: "Transmuta pequeños gastos diarios, como ese café, en una poderosa poción de ahorro. Cada moneda guardada es un paso hacia tu piedra filosofal financiera."
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelPro,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching financial tip from Gemini:", error);
    return "La sabiduría del Oráculo está momentáneamente nublada. Intenta más tarde.";
  }
};

// Helper function to convert file to base64 for Gemini API
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// New function to analyze receipt
export const analyzeReceipt = async (imageFile: File): Promise<{ name: string; price: number }[]> => {
  if (!API_KEY) {
    throw new Error("API_KEY is not set. Cannot analyze receipt.");
  }
  
  const imagePart = await fileToGenerativePart(imageFile);
  
  const prompt = `
    You are an expert receipt scanner. Analyze the provided image of a shopping receipt.
    Extract each line item. Identify the item's name and its price.
    Ignore totals, subtotals, taxes, discounts, and any non-item lines.
    Return the data as a valid JSON array of objects, where each object has 'name' (string) and 'price' (number) keys.
    The response MUST be only the JSON array, with no surrounding text or markdown backticks.
    Example format: [{"name": "Leche Entera", "price": 1.50}, {"name": "Pan Molde", "price": 2.25}]
    If you cannot parse the image or find any items, return an empty array [].
  `;

  try {
    const response = await ai.models.generateContent({
        model: modelProImage,
        contents: { parts: [imagePart, { text: prompt }] },
    });
    
    let textResponse = response.text.trim();
    // Clean up potential markdown code block
    if (textResponse.startsWith('```json')) {
      textResponse = textResponse.substring(7);
    }
    if (textResponse.endsWith('```')) {
      textResponse = textResponse.slice(0, -3);
    }

    const parsed = JSON.parse(textResponse);
    if (Array.isArray(parsed)) {
      // Validate structure
      return parsed.filter(item => typeof item.name === 'string' && typeof item.price === 'number');
    }
    return [];
  } catch (error) {
    console.error("Error analyzing receipt with Gemini:", error);
    throw new Error("No se pudo interpretar el ticket. Intenta con una imagen más clara.");
  }
};

export const findPromotions = async (items: string[]): Promise<string> => {
    if (!API_KEY) {
        return "La función de búsqueda de ofertas requiere una API Key de Gemini.";
    }
    if (items.length === 0) {
        return "Añade artículos a tu lista para buscar ofertas."
    }

    const itemList = items.join(', ');
    const prompt = `
        Actúa como un asistente de compras experto para un usuario en Uruguay.
        Dada la siguiente lista de compras: [${itemList}].
        Simula una búsqueda de promociones y ofertas actuales en los principales supermercados de Uruguay (ej. Tienda Inglesa, Disco, Devoto, Geant).
        Busca también ofertas con tarjetas de crédito comunes (ej. Itaú, Scotiabank, BROU).
        Presenta un resumen muy breve y útil de los 2 o 3 mejores hallazgos.
        La respuesta DEBE ser en español.
        Ejemplo de respuesta: "¡Atención, Alquimista! Encontré que hay 2x1 en Leche Conaprole en Tienda Inglesa. Además, pagando con Scotiabank tienes un 15% de descuento en toda tu compra en Disco los miércoles."
    `;

     try {
        const response = await ai.models.generateContent({
            model: modelPro,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching promotions from Gemini:", error);
        return "No se pudieron buscar ofertas en este momento. El cosmos no está alineado.";
    }
};

export const suggestCategory = async (description: string, categories: Category[]): Promise<string> => {
    if (!API_KEY) {
        throw new Error("API Key de Gemini no configurada.");
    }
    if (!description) {
        throw new Error("La descripción está vacía.");
    }

    const categoryList = categories.map(c => `'${c.name}' (id: ${c.id})`).join(', ');

    const prompt = `
        You are an expert financial categorizer.
        Given the transaction description: "${description}"
        And the available categories: [${categoryList}]
        Which category ID is the most appropriate?
        Respond with ONLY the category ID (e.g., 'cat-7'). Do not add any other text or explanation.
        If no category is a good fit, respond with the ID for 'Otros Gastos' or 'Otros Ingresos'.
    `;

    try {
        const response = await ai.models.generateContent({
            // FIX: Updated model to 'gemini-2.5-flash' as it is recommended for basic text tasks.
            model: 'gemini-2.5-flash', // Use a faster model for this task
            contents: prompt,
        });
        const categoryId = response.text.trim();
        // Basic validation to see if the response is a valid category ID
        if (categories.some(c => c.id === categoryId)) {
            return categoryId;
        }
        throw new Error("Respuesta de IA no válida.");
    } catch (error) {
        console.error("Error suggesting category with Gemini:", error);
        throw new Error("No se pudo sugerir una categoría.");
    }
};