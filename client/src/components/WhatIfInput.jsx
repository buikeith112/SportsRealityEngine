import { useState } from "react";

const SUGGESTIONS = [
  "What if the defender had blocked the shot?",
  "What if it was a buzzer beater?",
  "What if the player dunked instead?",
  "What if the crowd was silent?",
];

export default function WhatIfInput({ onSubmit, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (value) => {
    const v = value || text;
    if (!v.trim()) return;
    onSubmit(v.trim());
    setText("");
  };

  return (
    <div className="animate-fade-in-up bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-nba-orange mb-3">
        ✨ What If? — Reimagine This Play
      </h3>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="What if the defender had jumped?"
          disabled={disabled}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-nba-orange/50 disabled:opacity-50"
        />
        <button
          onClick={() => handleSubmit()}
          disabled={disabled || !text.trim()}
          className="px-5 py-2.5 bg-gradient-to-r from-nba-orange to-nba-red text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {disabled ? "Reimagining..." : "Reimagine"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSubmit(s)}
            disabled={disabled}
            className="text-xs px-3 py-1.5 border border-white/10 rounded-full text-white/40 hover:text-white/70 hover:border-white/30 transition-all disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
