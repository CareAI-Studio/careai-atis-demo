import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { healthRouter } from "./routes/health.routes.js";
import { gameRouter } from "./routes/game.routes.js";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 3001);

const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://192.168.0.162:5173",
  "https://atis.careai.cz",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Povolit požadavky bez originu: curl, health check, serverové testy apod.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
  }),
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