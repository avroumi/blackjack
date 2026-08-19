import { AppError } from "../utils/appError.js";

export const createRoundsRepo = (roundTable) => {
  const createRound = async (dataRound) => {
    const { data, error, status } = await roundTable
      .insert(dataRound)
      .select()
      .single();
    if (error) {
      throw new AppError(error.message, status);
    }
    return data;
  };

  const findActiveRoundByPlayerId = async (playerId) => {
    const { data, error, status } = await roundTable
      .select()
      .eq("playerId", playerId)
      .eq("status", "in_progress")
      .maybeSingle();
    if (error) {
      throw new AppError(error.message, status);
    }
    return data;
  };

  const updateRound = async (updateRound, roundId) => {
    const { data, error, status } = await roundTable
      .update(updateRound)
      .eq("id", roundId)
      .select()
      .single();
    if (error) {
      throw new AppError(error.message, status);
    }
    return data;
  };
  return {
    updateRound,
    findActiveRoundByPlayerId,
    createRound,
  };
};
