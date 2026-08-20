# ♠️ BLACKJACK ROYALE ♥️

<div align="center">

# 🎰 BLACKJACK ROYALE

### A full-stack Blackjack game built with Node.js, Express, Supabase & Vanilla JavaScript

**♠ Play • ♥ Bet • ♦ Hit • ♣ Stand**

---

`Backend` • `Database` • `Frontend` • `Docker` • `Tests`

</div>

---

## 🎮 About the Project

**Blackjack Royale** is a complete Blackjack application with a real backend, persistent database, game logic, responsive frontend and automated tests.

The project was built to practice a clean separation between:

```text
Frontend
   ↓
Routes / Controllers
   ↓
Game Service
   ↓
Repositories
   ↓
Supabase Database
```

The player starts anonymously with **1000 chips**, places a bet and plays against the dealer.

No account. No password. Just Blackjack. 🃏

---

## ✨ Features

- 🎲 Anonymous player creation
- 💰 Starting balance of **1000 chips**
- 🪙 Custom betting system
- ⚡ Quick-bet chips
- 🚀 MAX bet button
- 🧹 CLEAR bet button
- 🃏 Random card drawing
- 🎯 Dynamic hand-value calculation
- ♠️ Ace automatically changes from `11` to `1` when necessary
- 🤵 Dealer automatically draws until reaching at least **17**
- 👁️ Dealer's second card stays hidden during the round
- 💥 HIT and STAND actions
- 🏆 Win / Lose / Push results
- 💸 Automatic chip payouts
- 🚫 Only one active round per player
- 🔄 Game recovery after page refresh
- 💾 Player ID stored in `localStorage`
- 🎨 Animated casino-style interface
- 🃏 Animated card reveal
- 💥 Full-screen win / lose animation
- 📉 Animated chip balance
- ☠️ BANKRUPT screen at `0` chips
- 🔁 NEW GAME creates a fresh player
- 🐳 Docker support
- 🧪 Unit tests with Node's native test runner

---

# 🃏 Blackjack Rules

## Player

The player starts every new account with:

```text
1000 CHIPS
```

At the beginning of each round:

```text
chips = chips - bet
```

The player receives **2 cards**.

Then the player can choose:

### ➕ HIT

Draw one additional card.

If:

```text
playerTotal > 21
```

the player immediately loses the round.

### ✋ STAND

The player stops drawing cards and lets the dealer play.

---

## 🤵 Dealer

The dealer receives **2 cards**, but only the first card is visible to the player.

When the player chooses **STAND**:

```text
Dealer total < 17
        ↓
   Draw a card
        ↓
Dealer total < 17
        ↓
   Draw again
```

The dealer stops when:

```text
dealerTotal >= 17
```

or when the dealer busts.

---

## 🧠 Card Values

| Card | Value |
|---|---:|
| 2 → 10 | Face value |
| J | 10 |
| Q | 10 |
| K | 10 |
| A | 11 or 1 |

### Ace logic

An Ace starts at **11**.

If the total is greater than 21, the value of an Ace is reduced by 10.

Example:

```text
A + 9 = 20

A + 9 + 8 = 28
            ↓
Ace becomes 1
            ↓
Total = 18
```

---

# 💰 Payout System

The bet is removed when the round starts.

| Result | Payout |
|---|---:|
| Player Bust | `0` |
| Dealer Win | `0` |
| Player Win | `bet × 2` |
| Dealer Bust | `bet × 2` |
| Push | `bet` |

Example:

```text
Balance: 1000
Bet:      200

Round starts
↓
Balance:  800

Player wins
↓
+400

Final balance: 1200
```

---

# 🏗️ Architecture

```text
black-jack-project/
│
├── public/
│   ├── game.html
│   ├── game.js
│   └── style.css
│
├── src/
│   ├── config/
│   │   └── supabase.js
│   │
│   ├── controllers/
│   │   └── game.controller.js
│   │
│   ├── middleware/
│   │   └── playerAuth.js
│   │
│   ├── repos/
│   │   ├── players.repo.js
│   │   └── rounds.repo.js
│   │
│   ├── routes/
│   │   └── game.routes.js
│   │
│   ├── use-cases/
│   │   └── createGameService.js
│   │
│   ├── utils/
│   │   ├── appError.js
│   │   └── cards.js
│   │
│   ├── container.js
│   └── server.js
│
├── tests/
│   └── use-cases/
│       └── game.service.test.js
│
├── Dockerfile
├── compose.yaml
├── package.json
└── README.md
```

---

# 🔌 Dependency Injection

The game uses **dependency injection** to keep the business logic independent from the database.

```javascript
const gameService = createGameService({
  playerRepo,
  roundRepo,
  drawCard,
  dealerLogic,
  calculateHandValue,
});
```

This makes the service easy to test because its dependencies can be replaced with mocks.

### Production

```text
Supabase
   ↓
Real Repository
   ↓
Real Game Service
```

### Unit Test

```text
Mock Repository
   ↓
Real Game Service
```

This allows the tests to control exactly what every dependency returns.

---

# 🗄️ Database

The project uses **Supabase** as the database layer.

## Players

A player contains:

```text
id
chips
created_at
```

New players start with:

```text
chips = 1000
```

## Rounds

A round contains:

```text
id
playerId
bet
playersCards
dealerCards
status
created_at
```

Possible round statuses:

```text
in_progress
player_bust
dealer_bust
player_win
dealer_win
push
```

Only **one `in_progress` round** can exist for the same player.

---

# 🌐 API

## `POST /start-game`

Creates a new anonymous player.

### Response

```json
{
  "playerId": 5,
  "chips": 1000
}
```

---

## `POST /start-round`

Starts a new Blackjack round.

### Headers

```text
x-player-id: PLAYER_ID
Content-Type: application/json
```

### Body

```json
{
  "bet": 100
}
```

### Response

```json
{
  "roundId": 10,
  "playersCards": [
    {
      "card": 10,
      "suit": "spade"
    },
    {
      "card": 4,
      "suit": "club"
    }
  ],
  "dealerUpCard": {
    "card": 7,
    "suit": "heart"
  },
  "playerTotal": 14,
  "chips": 900
}
```

---

## `POST /hit`

Draws one new card for the player.

### Headers

```text
x-player-id: PLAYER_ID
```

### Response

```json
{
  "playerCard": [
    {
      "card": 10,
      "suit": "spade"
    },
    {
      "card": 5,
      "suit": "heart"
    },
    {
      "card": 4,
      "suit": "club"
    }
  ],
  "playerTotal": 19,
  "status": "in_progress",
  "chips": 900
}
```

---

## `POST /stand`

Stops the player turn and runs the dealer logic.

### Headers

```text
x-player-id: PLAYER_ID
```

### Response

```json
{
  "playersCards": [],
  "dealerCards": [],
  "playerTotal": 18,
  "dealerTotal": 20,
  "status": "dealer_win",
  "chips": 800
}
```

---

## `GET /my-round`

Returns the player's current active round.

If no round exists:

```json
{
  "round": null
}
```

If a round exists, the dealer's hidden card is **not exposed**.

---

# 🔐 Player Identification

This project intentionally does **not** implement authentication.

The frontend stores the generated player ID:

```javascript
localStorage.setItem("playerId", player.playerId);
```

Protected endpoints send it through:

```text
x-player-id
```

The middleware then loads the player and attaches it to:

```javascript
req.player
```

---

# 🧪 Tests

The project uses Node.js native testing tools:

```javascript
import test, { mock } from "node:test";
import assert from "node:assert/strict";
```

The service is created with mocked dependencies.

Example:

```javascript
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
```

Then the real service is executed:

```javascript
const result = await gameService.hitService(player);
```

And its behaviour is verified:

```javascript
assert.equal(result.playerTotal, 19);
assert.equal(result.status, "in_progress");
assert.equal(result.chips, 900);
assert.equal(result.playerCard.length, 3);
```

### Run tests

```bash
npm test
```

or:

```bash
node --test
```

---

# 🚀 Installation

## 1. Clone the project

```bash
git clone YOUR_REPOSITORY_URL
cd black-jack-project
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create `.env`

Example:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=4500
```

Never commit real Supabase credentials.

## 4. Start the server

```bash
npm start
```

Then open:

```text
http://localhost:4500/game.html
```

---

# 🐳 Docker

The backend can also run inside Docker.

Build and start:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

The application must be able to start directly through Docker without requiring the database itself to run inside Docker.

---

# 🎮 Game Flow

```text
          START
            │
            ▼
     Create / Load Player
            │
            ▼
      Check Active Round
            │
      ┌─────┴─────┐
      │           │
     NO          YES
      │           │
      ▼           ▼
 Place Bet     Resume Game
      │
      ▼
  Start Round
      │
      ▼
 Player receives
    2 cards
      │
      ▼
 ┌───────────────┐
 │ HIT     STAND │
 └───┬───────┬───┘
     │       │
     ▼       ▼
 Draw Card   Dealer Plays
     │       │
     ▼       ▼
 Total>21?   Compare Hands
   │   │          │
  YES  NO         ▼
   │   │       WIN / LOSE
   ▼   └──► HIT / STAND
 BUST
```

---

# 🎨 Frontend Experience

The interface includes:

```text
♠ Casino-style table
♥ Red / black card suits
♦ Animated card dealing
♣ Hidden dealer card
🪙 Quick betting chips
💰 Animated balance
💥 Full-screen results
☠️ Bankrupt screen
🔁 New Game
```

The UI is built with:

```text
HTML
CSS
Vanilla JavaScript
```

No frontend framework is required.

---

# ⚠️ Error Handling

The backend uses a custom `AppError` class.

Examples:

```text
400 → Invalid bet
401 → Invalid player
404 → Round not found
409 → Player already has an active round
500 → Internal server error
```

The frontend catches API errors and displays them without crashing the application.

---

# 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| Node.js | Runtime |
| Express | HTTP server |
| Supabase | Database |
| JavaScript | Backend + Frontend |
| HTML | UI structure |
| CSS | Casino interface & animations |
| node:test | Testing |
| node:assert/strict | Assertions |
| mock.fn() | Dependency mocks |
| Docker | Containerization |

---

# 🎯 What This Project Demonstrates

This project demonstrates practical knowledge of:

- REST APIs
- Express routing
- Controllers
- Middleware
- Repository pattern
- Service / use-case layer
- Dependency injection
- Database persistence
- Error handling
- Asynchronous JavaScript
- DOM manipulation
- Fetch API
- Local Storage
- Responsive CSS
- UI animations
- Unit testing
- Mocking
- Docker

---

<div align="center">

## ♠️ READY TO PLAY? ♥️

```text
PLACE YOUR BET
      ↓
DEAL THE CARDS
      ↓
  BEAT THE HOUSE
```

### ♦ BLACKJACK ROYALE ♣

**Built as a full-stack JavaScript learning project.**

</div>
