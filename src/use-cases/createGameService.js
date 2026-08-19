import { AppError } from "../utils/appError.js";

export const createGameService = ({
  playerRepo,
  roundRepo,
  drawCard,
  dealerLogic,
  calculateHandValue,
}) => {
  async function startGameService() {
    return await playerRepo.createPlayer();
  }

  async function startRoundsService(player, bet) {
    const alreadyPLaying = await roundRepo.findActiveRoundByPlayerId(player.id);
    if (alreadyPLaying) {
      throw new AppError("One round allowed", 409);
    }

    if (bet <= 0) {
      throw new AppError("Bet must bee postive", 400);
    }
    if (bet > player.chips) {
      throw new AppError("You dnot have money, go home", 400);
    }

    const playersCards = [drawCard(), drawCard()];
    const dealerCards = [drawCard(), drawCard()];
    const roundNow = {
      bet,
      playerId: player.id,
      playersCards,
      dealerCards: dealerCards,
      status: "in_progress",
    };

    const newChips = player.chips - bet;

    await playerRepo.updatePlayerChips(player.id, newChips);
    const playerTotal = calculateHandValue(playersCards);
    const round = await roundRepo.createRound(roundNow);
    return {
      roundId: round.id,
      playersCards: round.playersCards,
      dealerUpCard: round.dealerCards[0],
      playerTotal,
      chips: newChips,
    };
  }

  async function hitService(player) {
    const round = await roundRepo.findActiveRoundByPlayerId(player.id);
    if (!round) {
      throw new AppError("Round not found", 404);
    }

    const actualPlayersCards = [...round.playersCards, drawCard()];
    const total = calculateHandValue(actualPlayersCards);
    if (total > 21) {
      round.status = "player_bust";
    }
    await roundRepo.updateRound(
      { playersCards: actualPlayersCards, status: round.status },
      round.id,
    );

    return {
      playerCard: actualPlayersCards,
      playerTotal: total,
      status: round.status,
      chips: player.chips,
    };
  }

  async function standService(player) {
    const round = await roundRepo.findActiveRoundByPlayerId(player.id);
    if (!round) {
      throw new AppError("Round not found", 404);
    }
    const dealer = dealerLogic(round.dealerCards);
    const totalPLayer = calculateHandValue(round.playersCards);
    const totalDealer = dealer.total;
    if (totalDealer > 21) {
      round.status = "dealer_bust";
    } else if (totalPLayer > totalDealer) {
      round.status = "player_win";
    } else if (totalPLayer === totalDealer) {
      round.status = "tekooo";
    } else if (totalDealer > totalPLayer) {
      round.status = "dealer_win";
    }
    if (round.status === "player_win" || round.status === "dealer_bust") {
      player.chips += round.bet * 2;
    } else if (round.status === "tekooo") {
      player.chips += round.bet;
    }
    const updateData = await roundRepo.updateRound(
      { status: round.status, dealerCards: dealer.cards },
      round.id,
    );
    const updateChips = await playerRepo.updatePlayerChips(
      player.id,
      player.chips,
    );
    return {
      playersCards: round.playersCards,
      dealerCards: dealer.cards,
      playerTotal: totalPLayer,
      dealerTotal: totalDealer,
      status: round.status,
      chips: updateChips.chips,
    };
  }

  async function myRoundService(player) {
    const round = await roundRepo.findActiveRoundByPlayerId(player.id);

    if (!round) {
      return {
        round: null,
      };
    }
    const playerTotal = calculateHandValue(round.playersCards);

    return {
      roundId: round.id,
      playersCards: round.playersCards,
      dealerUpCard: round.dealerCards[0],
      bet: round.bet,
      playerTotal,
      status: round.status,
    };
  }
  return {
    myRoundService,
    startRoundsService,
    standService,
    hitService,
    startGameService,
  };
};
