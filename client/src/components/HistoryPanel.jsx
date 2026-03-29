import { useState, useEffect } from "react";
import { getHistory, clearHistory } from "../services/history.js";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HistoryPanel({ isOpen, onClose, onRestoreEntry }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen) setHistory(getHistory());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0c0c0c] border-l border-white/10 z-50 flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-bold">Generation History</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-white/30 py-12">
              No generations yet. Generate a cinematic experience to see it here.
            </p>
          ) : (
            history.map((entry) => (
              <button
                key={entry.id}
                onClick={() => {
                  onRestoreEntry(entry);
                  onClose();
                }}
                className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-4 hover:border-nba-red/50 hover:bg-white/10 transition-all group"
              >
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  {entry.results?.storyboard?.imageDataUrl && (
                    <img
                      src={entry.results.storyboard.imageDataUrl}
                      alt=""
                      className="w-16 h-12 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">
                      {entry.play?.text}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {entry.gameContext?.awayTeam} vs {entry.gameContext?.homeTeam}
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">
                      {timeAgo(entry.timestamp)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleClear}
              className="w-full py-2 text-sm text-red-400/70 hover:text-red-400 border border-red-400/20 rounded-lg hover:border-red-400/40 transition-all"
            >
              Clear History
            </button>
          </div>
        )}
      </div>
    </>
  );
}
