import test, { mock } from "node:test";
import assert from "node:assert/strict";

import { createGameService } from "../../src/use-cases/createGameService.js";
import { error } from "node:console";

test("hitService adds a card and keeps round in progress", async () => {
  const player = {
    id: 1,
    chips: 900,
  };

  const round = {
    id: 10,
    playerId: 1,
    playersCards: [
      { card: 10, suit: "spade" },
      { card: 5, suit: "heart" },
    ],
    dealerCards: [],
    status: "in_progress",
  };

  const roundRepo = {
    findActiveRoundByPlayerId: mock.fn(async () => round),
    updateRound: mock.fn(async () => round),
  };

  const drawCard = mock.fn(() => ({
    card: 4,
    suit: "club",
  }));
  const calculateHandValue = mock.fn(() => 19);

  const gameService = createGameService({
    playerRepo: {},
    roundRepo,
    drawCard,
    dealerLogic: mock.fn(),
    calculateHandValue,
  });
  const result = await gameService.hitService(player);

  assert.deepEqual(result.playerTotal, 19);
  assert.deepStrictEqual(result.status, "in_progress");
  assert.deepStrictEqual(result.chips, 900);
  assert.deepEqual(result.playerCard.length, 3);
});

test("hitService changes status to player_bust when total is over 21", async () => {
  const player = {
    id: 1,
    chips: 900,
  };

  const round = {
    id: 10,
    playerId: 1,
    playersCards: [
      { card: 10, suit: "spade" },
      { card: 5, suit: "heart" },
    ],
    dealerCards: [],
    status: "in_progress",
  };

  const roundRepo = {
    findActiveRoundByPlayerId: mock.fn(async () => round),
    updateRound: mock.fn(async () => round),
  };

  const drawCard = mock.fn(() => ({
    card: 4,
    suit: "club",
  }));
  const calculateHandValue = mock.fn(() => 24);

  const gameService = createGameService({
    playerRepo: {},
    roundRepo,
    drawCard,
    dealerLogic: mock.fn(),
    calculateHandValue,
  });
  const result = await gameService.hitService(player);

  assert.equal(result.status, "player_bust");
});

test("StartRoundService test lambda cast ", async () => {
  const player = {
    id: 10,
    chips: 900,
  };
  const round = {
    id: 10,
    playerId: 1,
    playersCards: [
      { card: 10, suit: "spade" },
      { card: 5, suit: "heart" },
    ],
    dealerCards: [],
    status: "in_progress",
  };
  const bet = 200;
  const playerRepo = {
    updatePlayerChips: mock.fn(async () => player),
  };
  const roundRepo = {
    createRound: mock.fn(async (data) => ({ id: 10, ...data })),
    findActiveRoundByPlayerId: mock.fn(async () => null),
  };
  const drawCard = mock.fn(() => ({
    card: 4,
    suit: "club",
  }));
  const calculateHandValue = mock.fn(() => 24);

  const gameService = createGameService({
    playerRepo,
    roundRepo,
    drawCard,
    dealerLogic: mock.fn(),
    calculateHandValue,
  });
  const result = await gameService.startRoundsService(player, bet);

  assert.deepEqual(result.dealerUpCard, {
    card: 4,
    suit: "club",
  });
});

test("StartRoundService test already have a session ", async () => {
  const player = {
    id: 10,
    chips: 900,
  };
  const round = {
    id: 10,
    playerId: 1,
    playersCards: [
      { card: 10, suit: "spade" },
      { card: 5, suit: "heart" },
    ],
    dealerCards: [],
    status: "in_progress",
  };
  const bet = 200;
  const playerRepo = {
    updatePlayerChips: mock.fn(async () => player),
  };
  const roundRepo = {
    createRound: mock.fn(async (data) => ({ id: 10, ...data })),
    findActiveRoundByPlayerId: mock.fn(async () => round),
  };
  const drawCard = mock.fn(() => ({
    card: 4,
    suit: "club",
  }));
  const calculateHandValue = mock.fn(() => 24);

  const gameService = createGameService({
    playerRepo,
    roundRepo,
    drawCard,
    dealerLogic: mock.fn(),
    calculateHandValue,
  });

  await assert.rejects(() => gameService.startRoundsService(player, bet), {
    message: "One round allowed",
    statusCode: 409,
  });
});

test("StartRoundService test not enough money ", async () => {
  const player = {
    id: 10,
    chips: 0,
  };
  const round = {
    id: 10,
    playerId: 1,
    playersCards: [
      { card: 10, suit: "spade" },
      { card: 5, suit: "heart" },
    ],
    dealerCards: [],
    status: "in_progress",
  };
  const bet = 200;
  const playerRepo = {
    updatePlayerChips: mock.fn(async () => player),
  };
  const roundRepo = {
    createRound: mock.fn(async (data) => ({ id: 10, ...data })),
    findActiveRoundByPlayerId: mock.fn(async () => null),
  };
  const drawCard = mock.fn(() => ({
    card: 4,
    suit: "club",
  }));
  const calculateHandValue = mock.fn(() => 24);

  const gameService = createGameService({
    playerRepo,
    roundRepo,
    drawCard,
    dealerLogic: mock.fn(),
    calculateHandValue,
  });

  await assert.rejects(() => gameService.startRoundsService(player, bet), {
    message: "You don't have money, go home",
    statusCode: 400,
  });
});
