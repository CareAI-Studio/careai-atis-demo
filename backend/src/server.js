import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { healthRouter } from "./routes/health.routes.js";
import { gameRouter } from "./routes/game.routes.js";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "CareAI Slot Demo API",
    status: "running",
    endpoints: ["/api/health", "/api/game/spin"],
  });
});

app.use("/api/health", healthRouter);
app.use("/api/game", gameRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled backend error:", err);

  res.status(500).json({
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`CareAI Slot Demo API running on http://localhost:${PORT}`);
});