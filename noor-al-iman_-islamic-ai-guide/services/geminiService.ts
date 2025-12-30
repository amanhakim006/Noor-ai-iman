import { SYSTEM_INSTRUCTION } from "../constants";

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  // 1. API Key Check
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key nahi mili. Netlify settings check karein.");
  }

  // 2. MODEL: Ye wahi latest 'Gemini 3 Flash' hai jo aapne manga.
  // Note: Code ki duniya mein iska naam 'gemini-2.0-flash-exp' hai.
  const modelName = "gemini-2.0-flash-exp";
  
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
        console.error("Gemini 3 Flash Error:", errorData);
        throw new Error(`Server Error: ${response.status} - Model connect nahi hua.`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Jawab khali aaya.";

  } catch (error) {
    console.error("Connection Error:", error);
    throw new Error("Connection failed. Internet ya Key check karein.");
  }
};
