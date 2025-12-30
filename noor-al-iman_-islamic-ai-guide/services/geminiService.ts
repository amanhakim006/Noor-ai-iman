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
    
    // CHANGE: Hum 'gemini-pro' use karenge.
    // Ye model har jagah chalta hai aur kabhi fail nahi hota.
    const response = await ai.models.generateContent({
      model: "gemini-pro",
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
    throw new Error("Abhi server busy hai. Kripya thodi der baad try karein.");
  }
};
