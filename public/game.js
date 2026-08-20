const betInput = document.querySelector("#bet");
const startRoundButton = document.querySelector("#start-round");
const playerCardsContainer = document.querySelector("#player-cards");
const clearBetButton = document.querySelector("#clear-bet");
const dealerCardsContainer = document.querySelector("#dealer-cards");
const chipsElement = document.querySelector("#chips");
const betSection = document.querySelector("#bet-section");
const gameSection = document.querySelector("#game-section");
const hitButton = document.querySelector("#hit");
const playerTotalElement = document.querySelector("#player-total span");
const standButton = document.querySelector("#stand");
const resultElement = document.querySelector("#result");
const dealerTotalElement = document.querySelector("#dealer-total span");

const maxBetButton = document.querySelector("#max-bet");
const quickBetButtons = document.querySelectorAll(".quick-bet");
const currentBetElement = document.querySelector("#current-bet span");

const suitSymbols = {
  heart: "♥",
  diamond: "♦",
  club: "♣",
  spade: "♠",
};

async function start() {
  let playerId = localStorage.getItem("playerId");

  if (!playerId) {
    const response = await fetch("/start-game", {
      method: "POST",
    });

    const player = await response.json();

    localStorage.setItem("playerId", player.playerId);

    playerId = player.playerId;
    chipsElement.textContent = player.chips;
  }

  const round = await getMyRound(playerId);

  if (round.round !== null) {
    renderRound(round);
  }
}

async function getMyRound(playerId) {
  const response = await fetch("/my-round", {
    headers: {
      "x-player-id": playerId,
    },
  });
  const data = await response.json();
  return data;
}

async function startRound(playerId, bet) {
  const response = await fetch("/start-round", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-player-id": playerId },
    body: JSON.stringify({
      bet: Number(bet),
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message);
  }
  return data;
}

async function hit(playerId) {
  const result = await fetch("/hit", {
    method: "POST",
    headers: { "x-player-id": playerId },
  });
  const data = await result.json();
  return data;
}

async function stand(playerId) {
  const result = await fetch("/stand", {
    method: "POST",
    headers: { "x-player-id": playerId },
  });
  const data = await result.json();
  return data;
}

function renderRound(round) {
  resultElement.className = "";
  resultElement.textContent = "";

  dealerTotalElement.textContent = 0;
  dealerTotalElement.parentElement.classList.add("hidden");
  if (round.chips !== undefined) {
    const oldChips = Number(chipsElement.textContent);

    animateChips(oldChips, round.chips);

    chipsElement.textContent = round.chips;
  }
  playerTotalElement.textContent = round.playerTotal;
  playerCardsContainer.innerHTML = round.playersCards.map(renderCard).join("");
  currentBetElement.textContent = betInput.value;

  dealerCardsContainer.innerHTML = `
  ${renderCard(round.dealerUpCard)}

  <div class="card card-back">
    <span>♠</span>
  </div>
`;
  betSection.classList.add("hidden");
  gameSection.classList.remove("hidden");
}

startRoundButton.addEventListener("click", async () => {
  try {
    const playerId = localStorage.getItem("playerId");
    const bet = betInput.value;

    const round = await startRound(playerId, bet);

    renderRound(round);
  } catch (error) {
    renderError(error.message);
  }
});

hitButton.addEventListener("click", async () => {
  setGameButtonsDisabled(true);

  try {
    const playerId = localStorage.getItem("playerId");

    const result = await hit(playerId);

    renderPlayersCards(result.playerCard);

    const oldChips = Number(chipsElement.textContent);

    animateChips(oldChips, result.chips);

    chipsElement.textContent = result.chips;
    playerTotalElement.textContent = result.playerTotal;

    if (result.status === "player_bust") {
      renderResult(result.status);
      checkGameOver(result.chips);

      gameSection.classList.add("hidden");
      betSection.classList.remove("hidden");

      betInput.value = 0;
    }
  } finally {
    setGameButtonsDisabled(false);
  }
});

standButton.addEventListener("click", async () => {
  setGameButtonsDisabled(true);

  try {
    const playerId = localStorage.getItem("playerId");

    const result = await stand(playerId);

    dealerCardsContainer.innerHTML = "";

    for (const card of result.dealerCards) {
      dealerCardsContainer.insertAdjacentHTML("beforeend", renderCard(card));

      await sleep(400);
    }

    dealerTotalElement.textContent = result.dealerTotal;
    dealerTotalElement.parentElement.classList.remove("hidden");

    playerTotalElement.textContent = result.playerTotal;

    await sleep(300);

    const oldChips = Number(chipsElement.textContent);

    animateChips(oldChips, result.chips);
    chipsElement.textContent = result.chips;

    await sleep(200);

    renderResult(result.status);
    checkGameOver(result.chips);

    currentBetElement.textContent = 0;

    gameSection.classList.add("hidden");
    betSection.classList.remove("hidden");

    betInput.value = 0;
  } finally {
    setGameButtonsDisabled(false);
  }
});
quickBetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = Number(button.dataset.bet);
    const currentBet = Number(betInput.value) || 0;

    betInput.value = currentBet + value;

    button.classList.add("chip-clicked");
    betInput.classList.add("bet-pulse");

    setTimeout(() => {
      button.classList.remove("chip-clicked");
      betInput.classList.remove("bet-pulse");
    }, 250);
  });
});

function renderPlayersCards(cards) {
  playerCardsContainer.innerHTML = cards.map(renderCard).join("");
}

function renderResult(status) {
  resultElement.className = "result-overlay";

  if (status === "player_win" || status === "dealer_bust") {
    resultElement.textContent = "YOU WIN";
    resultElement.classList.add("result-win");
  } else if (status === "dealer_win" || status === "player_bust") {
    resultElement.textContent = "YOU LOSE";
    resultElement.classList.add("result-lose");
    currentBetElement.textContent = 0;
  } else if (status === "tekooo") {
    resultElement.textContent = "TEKOOOOOOOOOOO";
    resultElement.classList.add("result-push");
  }

  setTimeout(() => {
    resultElement.classList.add("result-hide");
  }, 1800);

  setTimeout(() => {
    resultElement.className = "";
    resultElement.textContent = "";
  }, 2400);
}

maxBetButton.addEventListener("click", () => {
  const chips = Number(chipsElement.textContent);

  betInput.value = chips;

  betInput.classList.add("bet-pulse");

  setTimeout(() => {
    betInput.classList.remove("bet-pulse");
  }, 250);
});

clearBetButton.addEventListener("click", () => {
  betInput.value = 0;
});

function renderCard(card) {
  const isRed = card.suit === "heart" || card.suit === "diamond";
  const symbol = suitSymbols[card.suit];

  return `
    <div class="card ${isRed ? "red-card" : ""}">
      
      <div class="card-corner card-corner-top">
        <span>${card.card}</span>
        <span>${symbol}</span>
      </div>

      <div class="card-center-suit">
        ${symbol}
      </div>

      <div class="card-corner card-corner-bottom">
        <span>${card.card}</span>
        <span>${symbol}</span>
      </div>

    </div>
  `;
}

function setGameButtonsDisabled(disabled) {
  hitButton.disabled = disabled;
  standButton.disabled = disabled;
}

function renderError(message) {
  resultElement.className = "error-message";
  resultElement.textContent = message;

  setTimeout(() => {
    resultElement.classList.add("error-hide");
  }, 1800);

  setTimeout(() => {
    resultElement.className = "";
    resultElement.textContent = "";
  }, 2400);
}

function animateChips(oldValue, newValue) {
  chipsElement.classList.remove("chips-up", "chips-down");

  if (newValue > oldValue) {
    chipsElement.classList.add("chips-up");
  } else if (newValue < oldValue) {
    chipsElement.classList.add("chips-down");
  }

  setTimeout(() => {
    chipsElement.classList.remove("chips-up", "chips-down");
  }, 700);
}

function checkGameOver(chips) {
  if (Number(chips) !== 0) {
    return;
  }

  setTimeout(() => {
    resultElement.className = "game-over";

    resultElement.innerHTML = `
      <div class="game-over-content">
        <div class="game-over-title">BANKRUPT</div>
        <div class="game-over-text">You have no chips left</div>
        <button id="new-game-button">NEW GAME</button>
      </div>
    `;

    const newGameButton = document.querySelector("#new-game-button");

    newGameButton.addEventListener("click", () => {
      localStorage.removeItem("playerId");
      location.reload();
    });
  }, 2500);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

start();
