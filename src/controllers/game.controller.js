import { GameService } from "../container.js";

export const startGameController = async (req, res, next) => {
  try {
    const player = await GameService.startGameService();

    return res.status(201).json({
      playerId: player.id,
      chips: player.chips,
    });
  } catch (error) {
    next(error);
  }
};

export const startRoundController = async (req, res, next) => {
  const { bet } = req.body;
  try {
    const round = await GameService.startRoundsService(req.player, bet);
    return res.status(201).json(round);
  } catch (error) {
    next(error);
  }
};

export const hitController = async (req, res, next) => {
  try {
    const result = await GameService.hitService(req.player);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const standController = async (req, res, next) => {
  try {
    const result = await GameService.standService(req.player);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const myRoundController = async (req, res, next) => {
  try {
    const round = await GameService.myRoundService(req.player);
    return res.status(200).json(round);
  } catch (error) {
    next(error);
  }
};
