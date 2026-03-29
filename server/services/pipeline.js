import { runDirectorBrain } from "./director.js";
import { generateStoryboard } from "./nanoBanana.js";
import { generateMusic } from "./lyria.js";
import { generateCommentary } from "./tts.js";
import { submitVeoGeneration, pollVeoOperation } from "./veo.js";

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function runPipeline(res, play, gameContext, whatIf) {
  try {
    // Step 1: Director Brain
    sendSSE(res, "status", { step: "director", state: "loading" });
    const playData = { ...play, whatIf };
    const sceneJSON = await runDirectorBrain(playData, gameContext);
    sendSSE(res, "status", { step: "director", state: "done" });
    sendSSE(res, "director", { scene: sceneJSON });

    // Step 2: Run all generators in parallel
    // For What If mode, skip Veo and Lyria
    const isWhatIf = !!whatIf;

    sendSSE(res, "status", { step: "storyboard", state: "loading" });
    sendSSE(res, "status", { step: "commentary", state: "loading" });
    if (!isWhatIf) {
      sendSSE(res, "status", { step: "music", state: "loading" });
      sendSSE(res, "status", { step: "video", state: "loading" });
    }

    // Launch all promises
    const storyboardPromise = generateStoryboard(sceneJSON)
      .then((imageDataUrl) => {
        sendSSE(res, "storyboard", { imageDataUrl });
        sendSSE(res, "status", { step: "storyboard", state: "done" });
      })
      .catch((err) => {
        console.error("Storyboard error:", err.message);
        sendSSE(res, "status", { step: "storyboard", state: "error" });
      });

    const ttsPromise = generateCommentary(sceneJSON)
      .then((audioDataUrl) => {
        sendSSE(res, "commentary", { audioDataUrl });
        sendSSE(res, "status", { step: "commentary", state: "done" });
      })
      .catch((err) => {
        console.error("TTS error:", err.message);
        sendSSE(res, "status", { step: "commentary", state: "error" });
      });

    const promises = [storyboardPromise, ttsPromise];

    if (!isWhatIf) {
      const musicPromise = generateMusic(sceneJSON)
        .then((audioDataUrl) => {
          sendSSE(res, "music", { audioDataUrl });
          sendSSE(res, "status", { step: "music", state: "done" });
        })
        .catch((err) => {
          console.error("Lyria error:", err.message);
          sendSSE(res, "status", { step: "music", state: "error" });
        });

      const veoPromise = (async () => {
        try {
          const opName = await submitVeoGeneration(
            `Cinematic slow-motion NBA basketball. ${sceneJSON.videoPrompt}. Dramatic arena lighting, ESPN broadcast style.`
          );
          const videoDataUrl = await pollVeoOperation(opName);
          if (videoDataUrl) {
            sendSSE(res, "video", { videoDataUrl });
            sendSSE(res, "status", { step: "video", state: "done" });
          } else {
            sendSSE(res, "video_timeout", {
              message: "Video generation timed out — showing storyboard",
            });
            sendSSE(res, "status", { step: "video", state: "error" });
          }
        } catch (err) {
          console.error("Veo error:", err.message);
          sendSSE(res, "video_timeout", { message: err.message });
          sendSSE(res, "status", { step: "video", state: "error" });
        }
      })();

      promises.push(musicPromise, veoPromise);
    }

    await Promise.allSettled(promises);
    sendSSE(res, "complete", {});
  } catch (err) {
    console.error("Pipeline error:", err);
    sendSSE(res, "error", { message: err.message });
  } finally {
    res.end();
  }
}
