import "./env.js";
import express from "express";
import cors from "cors";
import gamesRouter from "./routes/games.js";
import generateRouter from "./routes/generate.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));

app.use("/api/games", gamesRouter);
app.use("/api/generate", generateRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
