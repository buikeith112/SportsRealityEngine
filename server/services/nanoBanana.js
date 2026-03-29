import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStoryboard(sceneJSON) {
  const prompt = `Cinematic sports photography, NBA arena, dramatic lighting, shallow depth of field.
${sceneJSON.sceneDescription}
Style: ESPN broadcast quality, motion blur on ball, high contrast.
NO text, NO watermarks, NO logos.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-image",
    contents: prompt,
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image returned from Nano Banana");
}
