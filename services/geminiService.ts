import { GoogleGenAI, Type } from "@google/genai";
import { BurgerRecommendation } from "../types";

// Usamos la variable de entorno estándar de Vite para Vercel
const getApiKey = () => import.meta.env.VITE_API_KEY || "";

export const getBurgerRecommendation = async (mood: string): Promise<BurgerRecommendation | null> => {
  try {
    const apiKey = getApiKey();
    // Si no hay clave, no intentamos llamar a la IA para evitar errores
    if (!apiKey) {
        console.error("Falta la API Key (VITE_API_KEY)");
        return null;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Un cliente en "Ray Burger Grill" se siente: "${mood}". Recomiéndale una hamburguesa creativa y deliciosa del menú.`,
      config: {
        systemInstruction: "Eres el Chef Ejecutivo de Ray Burger Grill, un experto apasionado por las hamburguesas gourmet al carbón. Tus respuestas son cortas, entusiastas y en español. SIEMPRE responde en formato JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nombre creativo de la hamburguesa" },
            description: { type: Type.STRING, description: "Descripción apetitosa y corta" },
            ingredients: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista de 4-5 ingredientes clave" 
            }
          },
          required: ["name", "description", "ingredients"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as BurgerRecommendation;
  } catch (error) {
    console.error("Error getting recommendation:", error);
    return null;
  }
};

export const getCelebrationMessage = async (points: number): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return "¡Felicidades! Estás más cerca de tu hamburguesa gratis.";

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `El cliente acaba de completar su compra número ${points}. Escribe un mensaje muy corto y festivo de una sola frase animándolo a seguir para llegar a la meta de 10.`,
      config: {
        systemInstruction: "Eres un animador de Ray Burger Grill.",
      }
    });
    return response.text || "¡Sigue así, la hamburguesa gratis te espera!";
  } catch (error) {
    return "¡Buen trabajo! Estás más cerca.";
  }
};
