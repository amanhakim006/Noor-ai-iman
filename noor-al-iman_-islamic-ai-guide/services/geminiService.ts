import { SYSTEM_INSTRUCTION } from "../constants";

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  // 1. API Key Uthana
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key nahi mili. Netlify settings check karein.");
  }

  // 2. MODEL: Jaisa aapne kaha, Gemini 3 Flash lagaya hai.
  // Purana '2.0-flash-exp' nikal diya hai.
  const modelName = "gemini-3.0-flash";
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          ...history.map((h) => ({
            role: h.role === "user" ? "user" : "model",
            parts: h.parts,
          })),
          { role: "user", parts: [{ text: prompt }] },
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
        console.error("Gemini 3 Error:", errorData);
        // Agar error aaye to user ko saaf dikhe
        throw new Error(`Server Error: ${response.status} - Model Name check karein.`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Jawab khali aaya.";

  } catch (error) {
    console.error("Connection Error:", error);
    throw new Error("Connection failed. Internet ya Key check karein.");
  }
};
