const BASE = "https://generativelanguage.googleapis.com/v1beta";

function apiKey() {
  return process.env.GEMINI_API_KEY;
}

export async function submitVeoGeneration(videoPrompt) {
  const res = await fetch(
    `${BASE}/models/veo-2.0-generate-001:predictLongRunning?key=${apiKey()}`,
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
    const res = await fetch(`${BASE}/${operationName}?key=${apiKey()}`);
    const result = await res.json();

    if (result.done) {
      console.log("Veo done response:", JSON.stringify(result, null, 2).slice(0, 2000));

      // Check for error first (Veo can return done:true WITH an error)
      if (result.error) {
        throw new Error(`Veo generation failed: ${result.error.message}`);
      }

      // Try multiple known response paths
      const b64 =
        result.response?.predictions?.[0]?.bytesBase64Encoded ||
        result.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.bytesBase64Encoded ||
        result.response?.generatedSamples?.[0]?.video?.bytesBase64Encoded;

      // Check for URI-based response (needs a second fetch)
      const uri =
        result.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
        result.response?.generatedSamples?.[0]?.video?.uri;

      if (b64) {
        return `data:video/mp4;base64,${b64}`;
      }

      if (uri) {
        // Fetch the video from the URI (requires API key auth)
        const separator = uri.includes("?") ? "&" : "?";
        const authedUri = `${uri}${separator}key=${apiKey()}`;
        const videoRes = await fetch(authedUri);
        if (!videoRes.ok) throw new Error(`Failed to fetch Veo video from URI: ${videoRes.status}`);
        const buffer = await videoRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return `data:video/mp4;base64,${base64}`;
      }

      throw new Error("Veo returned no video data. Response keys: " + JSON.stringify(Object.keys(result.response || {})));
    }

    if (result.error) {
      throw new Error(`Veo error: ${result.error.message}`);
    }

    await new Promise((r) => setTimeout(r, 5000));
  }

  return null; // timeout
}
