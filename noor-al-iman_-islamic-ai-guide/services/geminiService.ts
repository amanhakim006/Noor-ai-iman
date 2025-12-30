// HUM NAYA TOOL IMPORT KAR RAHE HAIN
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key Missing");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  try {
    const genAI = getAIClient();
    
    // Model: gemini-1.5-flash (Ye naye tool ke sath perfect chalta hai)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: h.parts,
      })),
      generationConfig: {
        temperature: 0.3,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Build Error Fixed:", error);
    throw new Error("Connection failed. Please try again.");
  }
};
