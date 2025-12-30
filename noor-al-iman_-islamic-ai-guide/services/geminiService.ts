import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// 1. Key Uthana
const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    alert("Error: API Key nahi mili! Netlify settings check karein.");
    throw new Error("API Key Missing");
  }
  
  return new GoogleGenAI({ apiKey: apiKey });
};

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  const ai = getAIClient();
  
  // 2. Data taiyar karna
  const contents = [
    ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
    { role: 'user', parts: [{ text: prompt }] }
  ];

  const config = {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.3,
  };

  try {
    // KOSHISH #1: Gemini 1.5 Flash (Latest)
    console.log("Trying Gemini 1.5 Flash...");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-001", // Exact version name
      contents: contents,
      config: config,
    });
    return response.text;

  } catch (error: any) {
    console.warn("Flash model failed, trying Pro...", error);

    try {
      // KOSHISH #2: Gemini Pro (Backup - Ye kabhi fail nahi hota)
      const response = await ai.models.generateContent({
        model: "gemini-pro", 
        contents: contents,
        config: config,
      });
      return response.text;

    } catch (finalError: any) {
      // Agar sab fail ho jaye, to Screen par Error dikhayein
      console.error("All models failed:", finalError);
      
      // Ye aapko bata dega ki asli galti kya hai bina console khole
      alert(`Connection Error: ${finalError.message || "Unknown Error"}`);
      
      throw new Error("Mafi chahte hain, abhi server connect nahi ho pa raha.");
    }
  }
};
