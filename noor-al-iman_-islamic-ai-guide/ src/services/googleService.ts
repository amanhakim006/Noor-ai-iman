import { SYSTEM_INSTRUCTION } from "../constants";

export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key nahi mili.");
  }

  // STEP 1: Pehle Gemini 3 (2.0 Flash Exp) try karenge
  try {
    const text = await callGoogleAI(apiKey, "gemini-2.0-flash-exp", prompt, history);
    return text;
  } catch (error) {
    console.warn("Gemini 2.0 fail ho gaya, ab 1.5 try kar rahe hain...", error);
    
    // STEP 2: Agar 3 fail ho jaye, to Gemini 1.5 Flash (Stable) backup use karenge
    try {
      const textBackup = await callGoogleAI(apiKey, "gemini-1.5-flash", prompt, history);
      return textBackup + " (Note: Jawab Gemini 1.5 se aaya hai)";
    } catch (finalError: any) {
      // Agar dono fail ho jayein, to Screen par asli Error dikhayenge
      alert(`Connection Error: ${finalError.message}`);
      throw new Error("Server connect nahi ho raha.");
    }
  }
};

// Helper Function (API Call karne ke liye)
async function callGoogleAI(apiKey: string, modelName: string, prompt: string, history: any[]) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        ...history.map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: h.parts,
        })),
        { role: "user", parts: [{ text: prompt }] },
      ],
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      generationConfig: { temperature: 0.3 },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Status: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}
