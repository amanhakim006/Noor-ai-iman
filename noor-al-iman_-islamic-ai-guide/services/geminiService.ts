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
    
    // CHANGE: Hum 'gemini-2.0-flash-exp' use kar rahe hain.
    // Ye Google ka sabse naya model hai.
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
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
    // Agar ye bhi na chale, to humein 'gemini-pro' par wapas jana padega
    throw new Error("Model Error: Gemini 2.0 bhi connect nahi ho raha.");
  }
};
