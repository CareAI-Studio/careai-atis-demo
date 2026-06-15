import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "careai-slot-demo-api",
    timestamp: new Date().toISOString(),
  });
});