import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  // Key uthana
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key Missing: Netlify settings check karein.");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  try {
    const genAI = getAIClient();
    
    // Model: gemini-1.5-flash (Fast & Stable)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    // Chat start karna
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: h.parts,
      })),
    });

    // Message bhejna
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Server connect nahi ho pa raha. Thodi der baad try karein.");
  }
};
