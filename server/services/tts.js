import { pcmToWav } from "../utils/pcmToWav.js";

const API_KEY = process.env.GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function generateCommentary(sceneJSON) {
  const res = await fetch(
    `${BASE}/models/gemini-2.5-flash-preview-tts:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: sceneJSON.commentaryScript }],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Fenrir" },
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const pcmBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!pcmBase64) throw new Error("No audio returned from TTS");

  const wavBase64 = pcmToWav(pcmBase64);
  return `data:audio/wav;base64,${wavBase64}`;
}
