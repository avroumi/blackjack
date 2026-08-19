export const drawCard = () => {
  const forme = ["heart", "spade", "diamond", "club"];
  const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];

  const randomCard = Math.floor(Math.random() * 13);
  const randomForme = Math.floor(Math.random() * 4);

  return { card: cards[randomCard], suit: forme[randomForme] };
};

export const calculateHandValue = (cards) => {
  let total = 0;
  const special = ["J", "Q", "K"];
  let as = 0;

  for (const card of cards) {
    if (special.includes(card.card)) {
      total += 10;
    } else if (card.card === "A") {
      total += 11;
      as += 1;
    } else {
      total += Number(card.card);
    }
  }
  while (total > 21 && as > 0) {
    total -= 10;
    as -= 1;
  }
  return total;
};

export const dealerLogic = (cards) => {
  const cardsList = [...cards];
  let total = calculateHandValue(cardsList);
  while (total < 17) {
    cardsList.push(drawCard());
    total = calculateHandValue(cardsList);
  }
  return { cards: cardsList, total };
};
