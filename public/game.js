const betInput = document.querySelector("#bet");
const startRoundButton = document.querySelector("#start-round");
const playerCardsContainer = document.querySelector("#player-cards");
const dealerCardsContainer = document.querySelector("#dealer-cards");
const chipsElement = document.querySelector("#chips");
const betSection = document.querySelector("#bet-section");
const gameSection = document.querySelector("#game-section");
const hitButton = document.querySelector("#hit");
const playerTotalElement = document.querySelector("#player-total span");
const standButton = document.querySelector("#stand");
const resultElement = document.querySelector("#result");
const dealerTotalElement = document.querySelector("#dealer-total span");
const betButtons = document.querySelectorAll("[data-bet]");

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

  dealerTotalElement.textContent = "?";
  if (round.chips !== undefined) {
    chipsElement.textContent = round.chips;
  }
  playerTotalElement.textContent = round.playerTotal;
  playerCardsContainer.innerHTML = round.playersCards.map(renderCard).join("");

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
    resultElement.textContent = error.message;
  }
});

hitButton.addEventListener("click", async () => {
  const playerId = localStorage.getItem("playerId");

  const result = await hit(playerId);
  renderPlayersCards(result.playerCard);

  if (result.status === "player_bust") {
    renderResult(result.status);

    gameSection.classList.add("hidden");
    betSection.classList.remove("hidden");
  }

  chipsElement.textContent = result.chips;
  playerTotalElement.textContent = result.playerTotal;

  console.log(result);
});

standButton.addEventListener("click", async () => {
  const playerId = localStorage.getItem("playerId");

  const result = await stand(playerId);

  dealerCardsContainer.innerHTML = result.dealerCards.map(renderCard).join("");

  playerTotalElement.textContent = result.playerTotal;
  dealerTotalElement.textContent = result.dealerTotal;
  chipsElement.textContent = result.chips;

  renderResult(result.status);

  gameSection.classList.add("hidden");
  betSection.classList.remove("hidden");
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

function renderCard(card) {
  const isRed = card.suit === "heart" || card.suit === "diamond";

  return `
    <div class="card ${isRed ? "red-card" : ""}">
      <span class="card-value">${card.card}</span>
      <span class="card-suit">${suitSymbols[card.suit]}</span>
      <span class="card-value-bottom">${card.card}</span>
    </div>
  `;
}

betButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = Number(button.dataset.bet);
    const currentBet = Number(betInput.value) || 0;

    betInput.value = currentBet + value;
  });
});

start();
