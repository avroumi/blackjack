import { playerRepo } from "../container.js";
import { AppError } from "../utils/appError.js";

export const playerAuth = async (req, res, next) => {
  try {
    const playerId = req.get("x-player-id");
    if (!playerId) {
      throw new AppError("Player id is required", 401);
    }

    const player = await playerRepo.findPLayerId(playerId);

    if (!player) {
      throw new AppError("Player not found", 401);
    }

    req.player = player;
    next();
  } catch (error) {
    next(error);
  }
};
