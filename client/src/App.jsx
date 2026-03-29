import { useState } from "react";
import GameSelector from "./components/GameSelector.jsx";
import PlaySelector from "./components/PlaySelector.jsx";
import GenerationExperience from "./components/GenerationExperience.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";

export default function App() {
  const [view, setView] = useState("games");
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [gameContext, setGameContext] = useState(null);
  const [restoredResults, setRestoredResults] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setView("plays");
  };

  const handleSelectPlay = (play, context) => {
    setSelectedPlay(play);
    setGameContext(context);
    setRestoredResults(null);
    setView("experience");
  };

  const handleRestoreEntry = (entry) => {
    setSelectedPlay(entry.play);
    setGameContext(entry.gameContext);
    setRestoredResults(entry.results);
    setView("experience");
  };

  const goHome = () => {
    setView("games");
    setSelectedGame(null);
    setSelectedPlay(null);
    setRestoredResults(null);
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={goHome}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-nba-red to-nba-orange flex items-center justify-center text-lg font-black">
              S
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">
                Sports Reality Engine
              </h1>
              <p className="text-[10px] text-white/30 tracking-widest uppercase">
                Powered by Google Gemini
              </p>
            </div>
          </div>

          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/15 rounded-lg text-white/50 hover:text-white hover:border-white/30 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </button>
        </div>
      </header>

      {/* History panel */}
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestoreEntry={handleRestoreEntry}
      />

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {view === "games" && <GameSelector onSelectGame={handleSelectGame} />}
        {view === "plays" && selectedGame && (
          <PlaySelector
            game={selectedGame}
            onSelectPlay={handleSelectPlay}
            onBack={() => setView("games")}
          />
        )}
        {view === "experience" && selectedPlay && gameContext && (
          <GenerationExperience
            key={`${selectedPlay.id}-${restoredResults ? "restored" : "live"}`}
            play={selectedPlay}
            gameContext={gameContext}
            restoredResults={restoredResults}
            onBack={() =>
              restoredResults ? goHome() : setView("plays")
            }
          />
        )}
      </main>
    </div>
  );
}
