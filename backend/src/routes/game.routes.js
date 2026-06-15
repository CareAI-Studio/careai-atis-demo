import { Router } from "express";
import { spinDemoGame } from "../controllers/game.controller.js";

export const gameRouter = Router();

gameRouter.post("/spin", spinDemoGame);