const API_KEY = process.env.GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

const MOOD_PROMPTS = {
  triumphant:
    "Epic orchestral hype, NBA arena crowd roar, triumphant brass, thundering drums, 120 BPM, stadium energy, climactic finale",
  intense:
    "Hard-hitting hip hop, 808 bass drop, trap drums, crowd chanting, intense energy, 95 BPM",
  tense:
    "Urgent percussion, rising tension, fast-paced funk, crowd building, 130 BPM",
  dramatic:
    "Sudden tension, sharp staccato strings, crowd gasp energy, dramatic pause, 80 BPM",
  celebratory:
    "Upbeat celebration, synth swells, crowd explosion, triumphant horns, 110 BPM",
};

export async function generateMusic(sceneJSON) {
  const musicPrompt =
    MOOD_PROMPTS[sceneJSON.musicMood] || MOOD_PROMPTS.triumphant;

  const res = await fetch(
    `${BASE}/models/lyria-3-clip-preview:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: musicPrompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO", "TEXT"],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lyria failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const audioPart = data.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData
  );

  if (!audioPart) throw new Error("No audio returned from Lyria");

  return `data:${audioPart.inlineData.mimeType};base64,${audioPart.inlineData.data}`;
}
