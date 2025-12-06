import { GoogleGenAI, Type } from "@google/genai";
import { BurgerRecommendation } from "../types";

// Usamos la variable de entorno estándar de Vite
const getApiKey = () => import.meta.env.VITE_API_KEY || "";

export const getBurgerRecommendation = async (mood: string): Promise<BurgerRecommendation | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error("Falta VITE_API_KEY");
        return null;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Un cliente en "Ray Burger Grill" se siente: "${mood}". Recomiéndale una hamburguesa creativa y deliciosa del menú.`,
      config: {
        systemInstruction: "Eres el Chef Ejecutivo de Ray Burger Grill. Tus respuestas son cortas, entusiastas y en español. SIEMPRE responde en formato JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "description", "ingredients"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as BurgerRecommendation;
  } catch (error) {
    console.error("Error AI:", error);
    return null;
  }
};

export const getCelebrationMessage = async (points: number): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return "¡Sigue así!";

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `El cliente lleva ${points} compras. Escribe una frase corta de ánimo.`,
    });
    return response.text || "¡Vamos por la gratis!";
  } catch (error) {
    return "¡Buen trabajo!";
  }
};
