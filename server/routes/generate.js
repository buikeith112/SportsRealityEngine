import { Router } from "express";
import { runPipeline } from "../services/pipeline.js";

const router = Router();

router.post("/", (req, res) => {
  const { play, gameContext, whatIf } = req.body;

  if (!play || !gameContext) {
    return res.status(400).json({ error: "Missing play or gameContext" });
  }

  // Set up SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.flushHeaders();

  // Handle client disconnect
  req.on("close", () => {
    res.end();
  });

  // Run the pipeline (async, streams events)
  runPipeline(res, play, gameContext, whatIf || null);
});

export default router;
