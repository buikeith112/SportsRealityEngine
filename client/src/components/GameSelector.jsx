import { useState, useEffect } from "react";
import { fetchGames } from "../services/api.js";

export default function GameSelector({ onSelectGame }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner" />
        <span className="ml-3 text-white/60">Loading today's games...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        Failed to load games: {error}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-20 text-white/50">
        <p className="text-xl font-semibold mb-2">No NBA games today</p>
        <p className="text-sm">Check back on a game day!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-white/80">
        Today's NBA Games
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game, i) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className="animate-fade-in-up bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 text-left hover:border-nba-red/50 hover:bg-white/10 transition-all duration-300 group"
            style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium px-2 py-1 rounded bg-white/10 text-white/50">
                {game.statusDetail}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {game.awayTeam.logo && (
                    <img
                      src={game.awayTeam.logo}
                      alt=""
                      className="w-8 h-8"
                    />
                  )}
                  <span className="font-semibold">{game.awayTeam.name}</span>
                </div>
                <span className="text-2xl font-bold tabular-nums">
                  {game.awayTeam.score}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {game.homeTeam.logo && (
                    <img
                      src={game.homeTeam.logo}
                      alt=""
                      className="w-8 h-8"
                    />
                  )}
                  <span className="font-semibold">{game.homeTeam.name}</span>
                </div>
                <span className="text-2xl font-bold tabular-nums">
                  {game.homeTeam.score}
                </span>
              </div>
            </div>

            <div className="mt-4 text-xs text-nba-red opacity-0 group-hover:opacity-100 transition-opacity">
              Click to view plays →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
