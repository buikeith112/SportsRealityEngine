import { Router } from "express";
import { getGames, getPlays } from "../services/espn.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const games = await getGames(req.query.date || null);
    res.json(games);
  } catch (err) {
    console.error("Games fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

router.get("/:id/plays", async (req, res) => {
  try {
    const plays = await getPlays(req.params.id);
    res.json(plays);
  } catch (err) {
    console.error("Plays fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch plays" });
  }
});

export default router;
