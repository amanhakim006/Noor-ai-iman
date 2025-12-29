
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const sendMessageToGemini = async (prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  try {
    const ai = getAIClient();
    
    // Using gemini-3-flash-preview for balanced speed and reasoning
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more consistent, factual Islamic answers
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
