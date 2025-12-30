import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  // Key check
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key gumshuda hai. Netlify check karein.");
  }
  return new GoogleGenAI({ apiKey: apiKey });
};

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  try {
    const ai = getAIClient();
    
    // SOLUTION: "gemini-1.5-flash" sahi naam hai. 
    // "Gemini 3" abhi exist nahi karta.
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return response.text || "Mafi chahte hain, jawab nahi mil paya.";

  } catch (error) {
    console.error("Gemini Error:", error);
    // Agar 1.5 Flash na chale, to user ko 'gemini-pro' try karne ko bolenge
    throw new Error("Model Error: Shayad aapke account par 1.5 Flash active nahi hai.");
  }
};
