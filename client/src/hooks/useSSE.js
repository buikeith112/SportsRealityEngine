import { useState, useCallback, useRef } from "react";
import { startGeneration } from "../services/api.js";

export function useSSE() {
  const [results, setResults] = useState({});
  const [steps, setSteps] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const controllerRef = useRef(null);

  const reset = useCallback(() => {
    setResults({});
    setSteps({});
    setIsComplete(false);
  }, []);

  const generate = useCallback(async (play, gameContext, whatIf = null) => {
    setIsGenerating(true);
    setIsComplete(false);
    setResults({});
    setSteps({});

    const { fetchPromise, controller } = startGeneration(
      play,
      gameContext,
      whatIf
    );
    controllerRef.current = controller;

    try {
      const response = await fetchPromise;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = null;
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === "status") {
                setSteps((prev) => ({
                  ...prev,
                  [data.step]: data.state,
                }));
              } else if (currentEvent === "complete") {
                setIsComplete(true);
              } else if (currentEvent === "error") {
                console.error("Pipeline error:", data.message);
              } else {
                setResults((prev) => ({
                  ...prev,
                  [currentEvent]: data,
                }));
              }
            } catch {
              // ignore parse errors on partial chunks
            }
            currentEvent = null;
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("SSE error:", err);
      }
    } finally {
      setIsGenerating(false);
      controllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setIsGenerating(false);
  }, []);

  return { results, steps, isGenerating, isComplete, generate, cancel, reset };
}
