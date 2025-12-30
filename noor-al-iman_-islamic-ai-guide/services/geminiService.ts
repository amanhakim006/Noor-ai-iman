import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key nahi mili. Netlify settings check karein.");
  }

  return new GoogleGenAI({ apiKey: apiKey });
};

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  try {
    const ai = getAIClient();
    
    // CHANGE: Aapke kehne mutabik humne yahan 'Gemini 3' model set kiya hai.
    // Dhyan rahe: Agar 'gemini-3.0-flash' na chale, to 'gemini-3.0-flash-preview' try karein.
    const response = await ai.models.generateContent({
      model: "gemini-3.0-flash",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return response.text || "Mafi chahte hain, jawab generate nahi ho paya.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Error aane par hum console mein asli naam check karne ko bolenge
    throw new Error("Model Error: Kya naam sahi hai? Google AI Studio check karein.");
  }
};
