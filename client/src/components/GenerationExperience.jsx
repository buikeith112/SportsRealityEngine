import { useCallback, useState } from "react";
import { useSSE } from "../hooks/useSSE.js";
import LoadingSteps from "./LoadingSteps.jsx";
import AudioPlayer from "./AudioPlayer.jsx";
import WhatIfInput from "./WhatIfInput.jsx";

export default function GenerationExperience({ play, gameContext, onBack }) {
  const { results, steps, isGenerating, isComplete, generate, reset } = useSSE();
  const [hasStarted, setHasStarted] = useState(false);
  const [isWhatIf, setIsWhatIf] = useState(false);

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

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-sm text-white/50 hover:text-white transition-colors"
      >
        ← Back to plays
      </button>

      {/* Play info card */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 mb-6">
        <p className="text-lg font-semibold mb-1">{play.text}</p>
        <p className="text-sm text-white/40">
          Q{play.period} · {play.clock} · {gameContext.awayTeam}{" "}
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
          {/* Loading steps */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
            <LoadingSteps steps={steps} isWhatIf={isWhatIf} />
          </div>

          {/* Visual: Video or Storyboard */}
          {(results.video || results.storyboard) && (
            <div className="animate-fade-in-up rounded-xl overflow-hidden border border-white/10">
              {results.video ? (
                <video
                  src={results.video.videoDataUrl}
                  autoPlay
                  muted
                  playsInline
                  controls
                  className="w-full aspect-video object-cover"
                />
              ) : results.storyboard ? (
                <img
                  src={results.storyboard.imageDataUrl}
                  alt="Storyboard"
                  className="w-full aspect-video object-cover"
                />
              ) : null}
              {results.video_timeout && !results.video && (
                <p className="text-xs text-white/30 p-2 text-center">
                  {results.video_timeout.message}
                </p>
              )}
            </div>
          )}

          {/* Director scene info */}
          {results.director && (
            <div className="animate-fade-in-up bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-nba-orange font-semibold mb-1">
                AI Director's Vision
              </p>
              <p className="text-sm text-white/60 leading-relaxed">
                {results.director.scene?.sceneDescription}
              </p>
            </div>
          )}

          {/* Audio players */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AudioPlayer
              src={results.commentary?.audioDataUrl}
              label="AI Commentary"
              volume={1.0}
            />
            <AudioPlayer
              src={results.music?.audioDataUrl}
              label="Hype Soundtrack"
              volume={0.4}
            />
          </div>

          {/* What If */}
          {isComplete && (
            <WhatIfInput onSubmit={handleWhatIf} disabled={isGenerating} />
          )}
        </div>
      )}
    </div>
  );
}
