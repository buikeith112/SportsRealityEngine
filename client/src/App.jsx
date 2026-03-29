import { useState } from "react";
import GameSelector from "./components/GameSelector.jsx";
import PlaySelector from "./components/PlaySelector.jsx";
import GenerationExperience from "./components/GenerationExperience.jsx";

export default function App() {
  const [view, setView] = useState("games"); // games | plays | experience
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const [gameContext, setGameContext] = useState(null);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setView("plays");
  };

  const handleSelectPlay = (play, context) => {
    setSelectedPlay(play);
    setGameContext(context);
    setView("experience");
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setView("games");
              setSelectedGame(null);
              setSelectedPlay(null);
            }}
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
        </div>
      </header>

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
            play={selectedPlay}
            gameContext={gameContext}
            onBack={() => setView("plays")}
          />
        )}
      </main>
    </div>
  );
}
