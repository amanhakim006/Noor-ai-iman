import { SYSTEM_INSTRUCTION } from "../constants";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  if (!API_KEY) {
    throw new Error("API Key nahi mili. Netlify settings check karein.");
  }

  // Hum seedha Google ke address par chithhi bhej rahe hain (No Library)
  // Model: gemini-1.5-flash (Fast & Free)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        generationConfig: {
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Error:", errorData);
        throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Jawab nikalna
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "Mafi chahte hain, jawab khali aaya.";

  } catch (error) {
    console.error("Final Error:", error);
    throw new Error("Connection Failed. Internet ya Key check karein.");
  }
};
