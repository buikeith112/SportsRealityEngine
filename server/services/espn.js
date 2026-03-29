const SCOREBOARD_URL =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
const SUMMARY_URL =
  "https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary";

const NOTABLE_PLAY_TYPES = new Set([
  "Dunk Shot",
  "Jump Shot",
  "3pt Shot",
  "Three Point Jumper",
  "Layup",
  "Free Throw",
  "Turnover",
  "Block",
  "Steal",
]);

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`ESPN API ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

export async function getGames(dateStr = null) {
  const url = dateStr
    ? `${SCOREBOARD_URL}?dates=${dateStr}`
    : SCOREBOARD_URL;
  const data = await fetchWithRetry(url);
  return data.events.map((event) => {
    const competition = event.competitions[0];
    const home = competition.competitors.find((c) => c.homeAway === "home");
    const away = competition.competitors.find((c) => c.homeAway === "away");
    return {
      id: event.id,
      name: event.name,
      shortName: event.shortName,
      status: competition.status.type.name,
      statusDetail: competition.status.type.shortDetail,
      homeTeam: {
        name: home.team.displayName,
        abbreviation: home.team.abbreviation,
        logo: home.team.logo,
        score: home.score,
      },
      awayTeam: {
        name: away.team.displayName,
        abbreviation: away.team.abbreviation,
        logo: away.team.logo,
        score: away.score,
      },
    };
  });
}

export async function getPlays(gameId) {
  const data = await fetchWithRetry(`${SUMMARY_URL}?event=${gameId}`);

  const plays = data.plays || [];
  const notable = plays.filter(
    (p) => p.scoringPlay || NOTABLE_PLAY_TYPES.has(p.type?.text)
  );

  return notable.map((p) => ({
    id: p.id,
    text: p.text,
    period: p.period?.number || 0,
    clock: p.clock?.displayValue || "",
    scoringPlay: p.scoringPlay || false,
    type: p.type?.text || "Unknown",
    team: p.team?.displayName || "",
    homeScore: p.homeScore || "",
    awayScore: p.awayScore || "",
  }));
}
