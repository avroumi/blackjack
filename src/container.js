import { playerTable, roundTable } from "./config/supabase.js";

import { createPlayersRepo } from "./repos/players.repo.js";
import { createRoundsRepo } from "./repos/rounds.repo.js";

import { createGameService } from "./use-cases/createGameService.js";

import {
  drawCard,
  dealerLogic,
  calculateHandValue,
} from "./utils/cards-logic.js";

export const playerRepo = createPlayersRepo(playerTable);
export const roundRepo = createRoundsRepo(roundTable);

export const GameService = createGameService({
  playerRepo,
  roundRepo,
  drawCard,
  dealerLogic,
  calculateHandValue,
});
