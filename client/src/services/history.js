const STORAGE_KEY = "sre-history";
const MAX_ENTRIES = 10;

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function addToHistory(entry) {
  const history = getHistory();

  // Exclude video data (too large for localStorage)
  const safeResults = { ...entry.results };
  delete safeResults.video;

  const newEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    play: entry.play,
    gameContext: entry.gameContext,
    results: safeResults,
  };

  const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // QuotaExceededError — evict oldest entries and retry
    const smaller = updated.slice(0, Math.max(1, updated.length - 3));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(smaller));
    } catch {
      // Give up silently
    }
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
