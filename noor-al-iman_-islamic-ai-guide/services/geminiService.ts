import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  // SOLUTION: Vite mein key aise uthayi jati hai
  // Make sure karein Netlify mein key ka naam 'VITE_GEMINI_API_KEY' ho
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key nahi mili. Netlify settings check karein.");
  }

  return new GoogleGenAI({ apiKey: apiKey });
};

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  try {
    const ai = getAIClient();
    
    // Model change kiya hai: 'gemini-1.5-flash' (Ye abhi sabse badhiya chal raha hai)
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

    return response.text || "Mafi chahte hain, jawab generate nahi ho paya.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    // User ko simple error dikhayenge
    throw new Error("Connection Error: Netlify se Key connect nahi ho pa rahi.");
  }
};
