import { GoogleGenAI } from "@google/genai";

let ai;
function getAI() {
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return ai;
}

export async function generateStoryboard(sceneJSON) {
  const prompt = `Cinematic sports photography, NBA arena, dramatic lighting, shallow depth of field.
${sceneJSON.sceneDescription}
Style: ESPN broadcast quality, motion blur on ball, high contrast.
NO text, NO watermarks, NO logos.`;

  const response = await getAI().models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
    config: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  // Log what we got for debugging
  console.log("Nano Banana response parts:", JSON.stringify(
    response.candidates?.[0]?.content?.parts?.map(p => ({ text: p.text?.slice(0, 100), hasInlineData: !!p.inlineData }))
  ));
  throw new Error("No image returned from Nano Banana");
}
