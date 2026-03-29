import { useState, useEffect } from "react";
import { fetchPlays } from "../services/api.js";

const TYPE_FILTERS = [
  "All",
  "Scoring",
  "3-Pointer",
  "Dunk",
  "Block",
  "Steal",
  "Turnover",
];

export default function PlaySelector({ game, onSelectPlay, onBack }) {
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchPlays(game.id)
      .then(setPlays)
      .catch(() => setPlays([]))
      .finally(() => setLoading(false));
  }, [game.id]);

  const filtered =
    filter === "All"
      ? plays
      : filter === "Scoring"
        ? plays.filter((p) => p.scoringPlay)
        : plays.filter((p) =>
            p.type.toLowerCase().includes(filter.toLowerCase())
          );

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-sm text-white/50 hover:text-white transition-colors"
      >
        ← Back to games
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-white/80">
          {game.awayTeam.abbreviation} {game.awayTeam.score} @ {game.homeTeam.abbreviation} {game.homeTeam.score}
        </h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              filter === f
                ? "bg-nba-red border-nba-red text-white"
                : "border-white/20 text-white/50 hover:border-white/40"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="spinner" />
          <span className="ml-3 text-white/60">Loading plays...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          No plays found for this filter
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {filtered.map((play, i) => (
            <button
              key={play.id || i}
              onClick={() =>
                onSelectPlay(play, {
                  homeTeam: game.homeTeam.name,
                  awayTeam: game.awayTeam.name,
                  homeScore: game.homeTeam.score,
                  awayScore: game.awayTeam.score,
                })
              }
              className="animate-fade-in-up w-full text-left bg-white/5 border border-white/10 rounded-lg p-4 hover:border-nba-red/50 hover:bg-white/10 transition-all group"
              style={{ animationDelay: `${i * 30}ms`, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-white/90 group-hover:text-white">
                  {play.text}
                </p>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className="text-xs text-white/40">
                    Q{play.period} {play.clock}
                  </span>
                  {play.scoringPlay && (
                    <span className="text-xs px-1.5 py-0.5 bg-nba-orange/20 text-nba-orange rounded">
                      Score
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-white/30">{play.type}</span>
                {play.team && (
                  <span className="text-xs text-white/30">{play.team}</span>
                )}
                <span className="text-xs text-white/30">
                  {play.awayScore} - {play.homeScore}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
