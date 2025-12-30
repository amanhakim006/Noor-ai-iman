import { SYSTEM_INSTRUCTION } from "../constants";

// Ye naya function hai jo Gemini 2.0 Flash (Exp) use karega
export const sendMessageToGemini = async (prompt: string, history: any[]) => {
  
  // 1. API Key Check
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key nahi mili. Kripya .env file check karein.");
  }

  // 2. MODEL: Aapki pasand ka 'Gemini 2.0 Flash Experimental'
  const modelName = "gemini-2.0-flash-exp";
  
  // 3. Direct Connection URL (No Library = No Error)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          // Pichli history bhejna zaroori hai context ke liye
          ...history.map((h) => ({
            role: h.role === "user" ? "user" : "model",
            parts: h.parts,
          })),
          // Naya sawal
          { role: "user", parts: [{ text: prompt }] },
        ],
        systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        generationConfig: {
          temperature: 0.3, // Thoda smart aur accurate jawab ke liye
        },
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini 2.0 Error:", errorData);
        throw new Error(`Server Error: ${response.status} - Model shayad busy hai.`);
    }

    const data = await response.json();
    
    // Jawab nikalna
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "Maaf karein, jawab khali aaya.";

  } catch (error) {
    console.error("Final Connection Error:", error);
    throw new Error("Internet ya Key connect nahi ho pa rahi.");
  }
};
