import { useCallback, useState, useEffect, useMemo } from "react";
import { useSSE } from "../hooks/useSSE.js";
import { addToHistory } from "../services/history.js";
import LoadingSteps from "./LoadingSteps.jsx";
import AudioPlayer from "./AudioPlayer.jsx";
import WhatIfInput from "./WhatIfInput.jsx";

export default function GenerationExperience({
  play,
  gameContext,
  onBack,
  restoredResults,
}) {
  const { results, steps, isGenerating, isComplete, generate, reset } = useSSE();
  const isRestored = !!restoredResults;
  const [hasStarted, setHasStarted] = useState(isRestored);
  const [isWhatIf, setIsWhatIf] = useState(false);

  // Merge live results with restored results for display
  const displayResults = useMemo(
    () => (isRestored && !isWhatIf && Object.keys(results).length === 0
      ? restoredResults
      : results),
    [isRestored, isWhatIf, results, restoredResults]
  );
  const displayComplete = isRestored && !isWhatIf && Object.keys(results).length === 0
    ? true
    : isComplete;

  // Save to history when generation completes (skip restored entries)
  useEffect(() => {
    if (isComplete && !isRestored && Object.keys(results).length > 0) {
      addToHistory({ play, gameContext, results });
    }
  }, [isComplete]);

  const handleGenerate = useCallback(() => {
    setHasStarted(true);
    setIsWhatIf(false);
    generate(play, gameContext);
  }, [play, gameContext, generate]);

  const handleWhatIf = useCallback(
    (whatIfText) => {
      setIsWhatIf(true);
      reset();
      generate(play, gameContext, whatIfText);
    },
    [play, gameContext, generate, reset]
  );

  const r = displayResults;

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-sm text-white/50 hover:text-white transition-colors"
      >
        &larr; Back to plays
      </button>

      {/* Play info card */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 mb-6">
        <p className="text-lg font-semibold mb-1">{play.text}</p>
        <p className="text-sm text-white/40">
          Q{play.period} &middot; {play.clock} &middot; {gameContext.awayTeam}{" "}
          {gameContext.awayScore} - {gameContext.homeTeam}{" "}
          {gameContext.homeScore}
        </p>
      </div>

      {!hasStarted ? (
        <div className="flex justify-center py-12">
          <button
            onClick={handleGenerate}
            className="animate-pulse-glow px-8 py-4 bg-gradient-to-r from-nba-red to-nba-orange text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity"
          >
            Generate Cinematic Experience
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Loading steps (hide when viewing restored) */}
          {!(isRestored && !isWhatIf && Object.keys(results).length === 0) && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
              <LoadingSteps steps={steps} isWhatIf={isWhatIf} />
            </div>
          )}

          {/* Visual: Video or Storyboard */}
          {(r.video || r.storyboard) && (
            <div className="animate-fade-in-up rounded-xl overflow-hidden border border-white/10">
              {r.video ? (
                <video
                  src={r.video.videoDataUrl}
                  autoPlay
                  muted
                  playsInline
                  controls
                  className="w-full aspect-video object-cover"
                />
              ) : r.storyboard ? (
                <img
                  src={r.storyboard.imageDataUrl}
                  alt="Storyboard"
                  className="w-full aspect-video object-cover"
                />
              ) : null}
              {r.video_timeout && !r.video && (
                <p className="text-xs text-white/30 p-2 text-center">
                  {r.video_timeout.message}
                </p>
              )}
            </div>
          )}

          {/* Director scene info */}
          {r.director && (
            <div className="animate-fade-in-up bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-nba-orange font-semibold mb-1">
                AI Director's Vision
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                {r.director.scene?.sceneDescription}
              </p>
            </div>
          )}

          {/* Audio players */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AudioPlayer
              src={r.commentary?.audioDataUrl}
              label="AI Commentary"
              volume={1.0}
              autoPlay={!isRestored}
            />
            <AudioPlayer
              src={r.music?.audioDataUrl}
              label="Hype Soundtrack"
              volume={0.4}
              autoPlay={!isRestored}
            />
          </div>

          {/* What If */}
          {displayComplete && (
            <WhatIfInput onSubmit={handleWhatIf} disabled={isGenerating} />
          )}
        </div>
      )}
    </div>
  );
}
