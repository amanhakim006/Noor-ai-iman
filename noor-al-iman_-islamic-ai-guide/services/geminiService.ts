import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Safety Check
  if (!apiKey) {
    throw new Error("API Key nahi mili. Netlify settings check karein.");
  }

  return new GoogleGenAI({ apiKey: apiKey });
};

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  try {
    const ai = getAIClient();
    
    // ✅ CORRECT MODEL: 'gemini-1.5-flash-002'
    // Ye latest hai, free hai, aur 404 error nahi dega.
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-002",
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
    console.error("Gemini Error:", error);
    
    // Agar latest bhi na chale, to hum user ko saaf bata denge
    throw new Error("Model Error: Google server connect nahi ho raha. Please try again.");
  }
};
