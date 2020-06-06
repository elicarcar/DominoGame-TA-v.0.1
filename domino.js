const stock = [];
const gamingBoard = [];
const player1 = { name: "player1", hand: [], turn: false };
const player2 = { name: "player2", hand: [], turn: false };
let boardNumbers = [];

function generateStock() {
  for (let n1 = 0; n1 < 7; n1++) {
    for (let n2 = 0; n2 <= n1; n2++) {
      stock.push([n2, n1]);
    }
  }
  createAndAppendElem(
    "button",
    "root",
    "stock",
    `Stock ${stock.length}`,
    "stockId"
  );

  const st = document.getElementById("stockId");
  st.addEventListener("click", () => drawATile());
}

function shuffleTiles() {
  let currentIndex = stock.length;
  let tempIndex;
  let randomizedIndex;

  while (currentIndex) {
    randomizedIndex = Math.floor(Math.random() * currentIndex--);

    tempIndex = stock[currentIndex];
    stock[currentIndex] = stock[randomizedIndex];
    stock[randomizedIndex] = tempIndex;
  }

  displayTemporaryElement("Tiles are shuffled.", "alert--info");
}

function distributeDominoes() {
  let i = 0;
  while (i < 14) {
    const p1Hand = stock.shift(i);
    player1.hand.push(p1Hand);
    i += 1;
    const p2Hand = stock.shift(i);
    i += 1;
    player2.hand.push(p2Hand);
  }

  for (let [i, v] of player1.hand.entries()) {
    createAndAppendElem(
      "li",
      player1.name,
      "tile-items",
      v.toString().replace(",", "|"),
      i
    );
  }

  for (let [i, v] of player2.hand.entries()) {
    createAndAppendElem(
      "li",
      player2.name,
      "tile-items",
      v.toString().replace(",", "|"),
      i
    );
  }

  const boardTable = document.querySelector(".board");
  boardTable.classList.remove("board_display-none");
}

function updateList(list, player) {
  const listToUpdate = document.getElementById(list);
  while (listToUpdate.firstChild) {
    listToUpdate.removeChild(listToUpdate.lastChild);
  }

  for (let [i, v] of player.hand.entries()) {
    createAndAppendElem(
      "li",
      player.name,
      "tile-items",
      v.toString().replace(",", "|"),
      i
    );
  }
}

function updateStock() {
  const stockBlock = document.getElementById("stockId");
  stockBlock.innerText = `Stock ${stock.length}`;
}

function drawATile() {
  const newTile = stock.shift();
  const playerCantPlay =
    !newTile.includes(boardNumbers[0]) && !newTile.includes(boardNumbers[1]);

  if (!stock.length && playerCantPlay) {
    const gameOver = document.querySelector(".container_game-over");
    gameOver.style.display = "block";
  }

  if (playerCantPlay) {
    displayTemporaryElement("Draw again", "alert_danger");
  } else {
    displayTemporaryElement("You can play now.", "alert_success");
    isButtonDisabled("stockId", true);
  }

  updateStock(`Stock ${stock.length}`);
  if (player1.turn) {
    player1.hand.push(newTile);
    updateList(player1.name, player1);
  } else {
    player2.hand.push(newTile);
    updateList(player2.name, player2);
  }
}

function startTheGame() {
  generateStock();
  shuffleTiles();
  distributeDominoes();
  isButtonDisabled("game-start", true);
  isButtonDisabled("stockId", true);

  const initialTile = stock.shift();
  gamingBoard.unshift(initialTile);
  updateStock();
  const leftNum = gamingBoard[0][0];
  const rightNum = gamingBoard[gamingBoard.length - 1][1];
  boardNumbers = [leftNum, rightNum];
  document.getElementById("player2").classList.add("list_visibility");
  player1.turn = true;
  writeProcessOnBoard(`The game started. The board is <${gamingBoard}>`);
}

function gamePlay(player, board, selectedTile, inx) {
  let playableTiles = [];

  for (let i of player.hand) {
    if (i.includes(board[0]) || i.includes(board[1])) {
      playableTiles.push(i);
    }
  }

  if (!playableTiles.length) {
    //check stock
    if (stock.length) {
      displayTemporaryElement(
        `${player.name} can't play. They will draw a tile`,
        "alert_danger"
      );
      isButtonDisabled("stockId", false);
      return;
    } else {
      const gameOver = document.querySelector(".container_game-over");
      gameOver.style.display = "block";
    }
  }

  //in case of selecting the other persons tile
  const playerHasTile = player.hand.includes(selectedTile);

  if (!playerHasTile || selectedTile === undefined) {
    displayTemporaryElement(
      `This is not your tile. Please select one from yours!`,
      "alert_danger"
    );

    return;
  }

  // in case of selecting unplayable tile
  const isNoMatch =
    selectedTile[0] !== board[0] &&
    selectedTile[0] !== board[1] &&
    selectedTile[1] !== board[0] &&
    selectedTile[1] !== board[1];

  if (isNoMatch) {
    displayTemporaryElement(
      "You cannot play this tile. Please select another one!",
      "alert_danger"
    );
    return;
  }

  if (selectedTile[0] === board[0] && selectedTile[0] === board[1]) {
    pushTile(player, selectedTile, inx, false);
  } else if (selectedTile[1] === board[0] && selectedTile[1] === board[1]) {
    unshiftTile(player, selectedTile, inx, false);
  } else if (selectedTile[0] === board[0] && selectedTile[0] !== board[1]) {
    unshiftTile(player, selectedTile, inx, true);
  } else if (selectedTile[0] === board[1] && selectedTile[0] !== board[0]) {
    pushTile(player, selectedTile, inx, false);
  } else if (selectedTile[1] === board[0] && selectedTile[1] !== board[1]) {
    unshiftTile(player, selectedTile, inx, false);
  } else if (selectedTile[1] === board[1] && selectedTile[1] !== board[0]) {
    pushTile(player, selectedTile, inx, true);
  }

  const boardItems = gamingBoard.map((item) => {
    return `<${item.toString().replace(",", ":")}>`;
  });

  setTimeout(() => {
    writeProcessOnBoard(`${player.name} played ${selectedTile}.`);
    writeProcessOnBoard(`The board is now ${boardItems}.`);
  }, 100);

  if (!player.hand.length) {
    const restartButton = document.getElementById("restart-win");
    const h4 = document.createElement("h4");
    h4.innerText = `${player.name} wins the game!`;
    restartButton.insertAdjacentElement("beforeend", h4);
    const gameOver = document.querySelector(".container-win");
    gameOver.style.display = "block";
  }

  if (player === player1) {
    player1.turn = false;
    player2.turn = true;
    document.getElementById("player1").classList.add("list_visibility");
    document.getElementById("player2").classList.remove("list_visibility");
  } else {
    player1.turn = true;
    player2.turn = false;
    document.getElementById("player2").classList.add("list_visibility");
    document.getElementById("player1").classList.remove("list_visibility");
  }
}

function playerStartsToPlay(event) {
  const index = event.target.id;
  const leftNum = gamingBoard[0][0];
  const rightNum = gamingBoard[gamingBoard.length - 1][1];
  boardNumbers = [leftNum, rightNum];
  if (player1.turn) {
    gamePlay(player1, boardNumbers, player1.hand[index], index);
  } else {
    gamePlay(player2, boardNumbers, player2.hand[index], index);
  }
}

/* ----- ** UTILS ** ------ */

function createAndAppendElem(child, parent, className, content, id = "") {
  const parentElem = document.getElementById(parent);
  const childElem = document.createElement(child);
  parentElem.appendChild(childElem);
  childElem.setAttribute("id", id);
  childElem.classList.add(className);
  childElem.innerText = content;
}

function writeProcessOnBoard(content) {
  const boardDiv = document.querySelector(".board");
  const p = document.createElement("p");
  p.classList.add("board_game-process");
  p.innerText = content;
  boardDiv.insertAdjacentElement("beforeend", p);
}

function displayTemporaryElement(text, alertType) {
  const infoContainer = document.querySelector(".container_info");
  const newDiv = document.createElement("div");
  newDiv.setAttribute("id", "inquirer");
  newDiv.classList.add(alertType);
  newDiv.innerText = text;

  infoContainer.appendChild(newDiv);
  setTimeout(function () {
    const tempDiv = document.getElementById("inquirer");
    tempDiv.remove();
  }, 1000);
}

function isButtonDisabled(id, bool) {
  document.getElementById(id).disabled = bool;
}

function pushTile(player, tile, index, reverse) {
  if (reverse) {
    tile.reverse();
  }

  player.hand.splice(index, 1);
  gamingBoard.push(tile);

  updateList(player.name, player);
}

function unshiftTile(player, tile, index, reverse) {
  if (reverse) {
    tile.reverse();
  }
  player.hand.splice(index, 1);
  gamingBoard.unshift(tile);

  updateList(player.name, player);
}
