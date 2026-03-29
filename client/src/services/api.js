const BASE = "/api";

export async function fetchGames(dateStr = null) {
  const params = dateStr ? `?date=${dateStr}` : "";
  const res = await fetch(`${BASE}/games${params}`);
  if (!res.ok) throw new Error("Failed to fetch games");
  return res.json();
}

export async function fetchPlays(gameId) {
  const res = await fetch(`${BASE}/games/${gameId}/plays`);
  if (!res.ok) throw new Error("Failed to fetch plays");
  return res.json();
}

export function startGeneration(play, gameContext, whatIf = null) {
  const controller = new AbortController();

  const fetchPromise = fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ play, gameContext, whatIf }),
    signal: controller.signal,
  });

  return { fetchPromise, controller };
}
