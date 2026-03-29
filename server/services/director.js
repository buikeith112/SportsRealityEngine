import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runDirectorBrain(playData, gameContext) {
  const prompt = `You are a sports cinematography director. Given this NBA play, output a JSON object with exactly these fields:
{
  "sceneDescription": "Rich visual paragraph for image generation — describe court location, player position, defender, crowd, lighting, camera angle",
  "videoPrompt": "Cinematic video prompt with motion, camera angle, lighting, action arc",
  "musicMood": "one of: triumphant | intense | tense | celebratory | dramatic",
  "playType": "one of: dunk | three_pointer | layup | free_throw | steal | block | turnover | game_winner",
  "commentaryScript": "2-3 sentence broadcaster-style narration of the play, present tense, explosive energy"
}

Play: ${playData.text}
Quarter: Q${playData.period}, Clock: ${playData.clock}
Teams: ${gameContext.homeTeam} ${gameContext.homeScore} - ${gameContext.awayTeam} ${gameContext.awayScore}
Scoring play: ${playData.scoringPlay}
Play type: ${playData.type}
${playData.whatIf ? `ALTERNATE REALITY: ${playData.whatIf} — modify scene to reflect this change` : ""}

Respond ONLY with valid JSON. No markdown, no backticks, no extra text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.candidates[0].content.parts[0].text;
  try {
    return JSON.parse(text.trim());
  } catch {
    // Retry with stricter prompt on parse failure
    const retry = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents:
        prompt +
        "\n\nYour previous response was not valid JSON. Output ONLY a raw JSON object, nothing else.",
    });
    const retryText = retry.candidates[0].content.parts[0].text;
    return JSON.parse(retryText.replace(/```json?\s*/g, "").replace(/```/g, "").trim());
  }
}
