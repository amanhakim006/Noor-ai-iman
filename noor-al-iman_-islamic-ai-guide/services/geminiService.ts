import { SYSTEM_INSTRUCTION } from "../constants";

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  // 1. Key check karna
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key nahi mili");
  }

  // 2. Direct Internet Call (Koi install ki zaroorat nahi)
  // Model: gemini-1.5-flash (Fastest & Free)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Error:", errorData);
        throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error) {
    console.error("Chat Error:", error);
    throw new Error("Connection failed. Internet check karein.");
  }
};
