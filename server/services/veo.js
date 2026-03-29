const API_KEY = process.env.GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function submitVeoGeneration(videoPrompt) {
  const res = await fetch(
    `${BASE}/models/veo-2.0-generate-exp:predictLongRunning?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: videoPrompt }],
        parameters: {
          aspectRatio: "16:9",
          sampleCount: 1,
          durationSeconds: 8,
          personGeneration: "allow_adult",
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Veo submit failed: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.name;
}

export async function pollVeoOperation(operationName, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await fetch(`${BASE}/${operationName}?key=${API_KEY}`);
    const result = await res.json();

    if (result.done) {
      const b64 = result.response?.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) throw new Error("Veo returned no video data");
      return `data:video/mp4;base64,${b64}`;
    }

    if (result.error) {
      throw new Error(`Veo error: ${result.error.message}`);
    }

    await new Promise((r) => setTimeout(r, 5000));
  }

  return null; // timeout
}
