import { AppError } from "../utils/appError.js";

export const createPlayersRepo = (playerTable) => {
  const createPlayer = async () => {
    const { data, error, status } = await playerTable
      .insert({})
      .select()
      .single();
    if (error) {
      throw new AppError(error.message, status);
    }
    return data;
  };

  const findPLayerId = async (playerId) => {
    const { data, error, status } = await playerTable
      .select()
      .eq("id", playerId)
      .single();
    if (error) {
      throw new AppError(error.message, status);
    }
    return data;
  };

  const updatePlayerChips = async (playerId, chips) => {
    const { data, error, status } = await playerTable
      .update({ chips })
      .eq("id", playerId)
      .select()
      .single();
    if (error) {
      throw new AppError(error.message, status);
    }
    return data;
  };

  return {
    findPLayerId,
    updatePlayerChips,
    createPlayer,
  };
};
