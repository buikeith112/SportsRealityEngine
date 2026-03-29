import { useState, useEffect } from "react";
import { fetchGames } from "../services/api.js";

function toESPN(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function toInputValue(espnDate) {
  return `${espnDate.slice(0, 4)}-${espnDate.slice(4, 6)}-${espnDate.slice(6, 8)}`;
}

function formatDisplayDate(espnDate) {
  const d = new Date(toInputValue(espnDate) + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toESPN(d);
}

export default function GameSelector({ onSelectGame }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getYesterday);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchGames(selectedDate)
      .then(setGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const todayESPN = toESPN(new Date());

  return (
    <div>
      {/* Date picker row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-white/80 mr-auto">
          {formatDisplayDate(selectedDate)}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(toInputValue(selectedDate) + "T12:00:00");
              d.setDate(d.getDate() - 1);
              setSelectedDate(toESPN(d));
            }}
            className="px-3 py-1.5 text-xs border border-white/20 rounded-lg text-white/50 hover:text-white hover:border-white/40 transition-all"
          >
            &larr; Prev
          </button>
          <input
            type="date"
            value={toInputValue(selectedDate)}
            max={toInputValue(todayESPN)}
            onChange={(e) =>
              setSelectedDate(e.target.value.replace(/-/g, ""))
            }
            className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-nba-red/50"
            style={{ colorScheme: "dark" }}
          />
          <button
            onClick={() => {
              const d = new Date(toInputValue(selectedDate) + "T12:00:00");
              d.setDate(d.getDate() + 1);
              const next = toESPN(d);
              if (next <= todayESPN) setSelectedDate(next);
            }}
            disabled={selectedDate >= todayESPN}
            className="px-3 py-1.5 text-xs border border-white/20 rounded-lg text-white/50 hover:text-white hover:border-white/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next &rarr;
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDate(getYesterday())}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              selectedDate === getYesterday()
                ? "bg-nba-red border-nba-red text-white"
                : "border-white/20 text-white/50 hover:border-white/40"
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setSelectedDate(todayESPN)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              selectedDate === todayESPN
                ? "bg-nba-red border-nba-red text-white"
                : "border-white/20 text-white/50 hover:border-white/40"
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner" />
          <span className="ml-3 text-white/60">Loading games...</span>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          Failed to load games: {error}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-20 text-white/50">
          <p className="text-xl font-semibold mb-2">No NBA games on this date</p>
          <p className="text-sm">Try picking a different date.</p>
        </div>
      ) : (
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
                      <img src={game.awayTeam.logo} alt="" className="w-8 h-8" />
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
                      <img src={game.homeTeam.logo} alt="" className="w-8 h-8" />
                    )}
                    <span className="font-semibold">{game.homeTeam.name}</span>
                  </div>
                  <span className="text-2xl font-bold tabular-nums">
                    {game.homeTeam.score}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-nba-red opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view plays &rarr;
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
