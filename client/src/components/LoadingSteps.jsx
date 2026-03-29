const STEP_CONFIG = {
  director: { label: "Directing the scene", icon: "🎬" },
  storyboard: { label: "Painting the storyboard", icon: "🎨" },
  music: { label: "Composing the soundtrack", icon: "🎵" },
  commentary: { label: "Recording commentary", icon: "🎙️" },
  video: { label: "Generating cinematic video", icon: "🎥" },
};

export default function LoadingSteps({ steps, isWhatIf }) {
  const stepKeys = isWhatIf
    ? ["director", "storyboard", "commentary"]
    : ["director", "storyboard", "music", "commentary", "video"];

  return (
    <div className="space-y-3">
      {stepKeys.map((key) => {
        const config = STEP_CONFIG[key];
        const state = steps[key]; // undefined | "loading" | "done" | "error"

        return (
          <div
            key={key}
            className="flex items-center gap-3 text-sm transition-all duration-300"
          >
            <span className="text-lg w-7 text-center">{config.icon}</span>
            <span
              className={`flex-1 ${
                state === "done"
                  ? "text-white/80"
                  : state === "error"
                    ? "text-red-400/80"
                    : state === "loading"
                      ? "text-white/60"
                      : "text-white/30"
              }`}
            >
              {config.label}...
            </span>
            <div className="w-6 flex justify-center">
              {state === "loading" && <div className="spinner" style={{ width: 16, height: 16 }} />}
              {state === "done" && (
                <span className="text-green-400 text-base">✓</span>
              )}
              {state === "error" && (
                <span className="text-red-400 text-base">✗</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
