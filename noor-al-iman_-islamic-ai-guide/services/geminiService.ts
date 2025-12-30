import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  // CHANGE 1: Yahan humne sahi variable naam 'GEMINI_API_KEY' daal diya hai
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
};

export const sendMessageToGemini = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    const ai = getAIClient();
    
    // CHANGE 2: Model ka naam sahi kiya hai (Gemini 1.5 Flash - jo sabse fast aur free hai)
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
      },
    });

    return response.text || "I apologize, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Mafi chahte hain, server mein kuch masla hai. Allahu A'lam.");
  }
};
