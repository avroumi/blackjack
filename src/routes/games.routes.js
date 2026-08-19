import {
  startGameController,
  hitController,
  standController,
  startRoundController,
  myRoundController,
} from "../controllers/game.controller.js";

import { playerAuth } from "../middleware/playerAuth.js";

import { Router } from "express";

const router = Router();

router.post("/start-game", startGameController);
router.post("/start-round", playerAuth, startRoundController);

router.post("/hit", playerAuth, hitController);
router.post("/stand", playerAuth, standController);

router.get("/my-round", playerAuth, myRoundController);

export default router;
