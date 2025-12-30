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
    
    // CHANGE: Ye hai Google ka Latest Stable Model (Gemini 1.5 Flash-8B)
    // Ye 'Free Tier' mein sabse badhiya chalta hai.
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-8b",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return response.text || "Jawab generate nahi ho paya.";

  } catch (error) {
    console.error("Gemini Error:", error);
    
    // Agar latest wala na chale, to hum user ko purana wala try karne ko bolenge
    throw new Error("Model Error: 1.5 Flash-8B fail ho gaya. Kya hum 'gemini-pro' try karein?");
  }
};
