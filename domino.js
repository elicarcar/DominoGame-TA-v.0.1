const stock = [];
const gamingBoard = [];
const player1 = { name: "player1", hand: [], turn: false };
const player2 = { name: "player2", hand: [], turn: false };
let buttonVal = "";
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
    "stock"
  );

  const st = document.getElementById("stock");
  st.addEventListener("click", () => drawATile());
}

// -- DONE --

function updateList(list, player) {
  const listToUpdate = document.getElementById(list);
  while (listToUpdate.firstChild) {
    listToUpdate.removeChild(listToUpdate.lastChild);
  }

  for (let [i, v] of player.hand.entries()) {
    createAndAppendElem(
      "li",
      player.name,
      "li--tile",
      v.toString().replace(",", "|"),
      i
    );
  }
}

function updateStock() {
  const stockBlock = document.getElementById("stock");
  stockBlock.innerText = `Stock ${stock.length}`;
}

// -- DONE --

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

  temporaryElement("Tiles are shuffled.", "alert--info");
}

// -- DONE --

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
      "li--tile",
      v.toString().replace(",", "|"),
      i
    );
  }

  for (let [i, v] of player2.hand.entries()) {
    createAndAppendElem(
      "li",
      player2.name,
      "li--tile",
      v.toString().replace(",", "|"),
      i
    );
  }

  const boardTable = document.querySelector(".board");
  boardTable.classList.remove("board--display-none");
}

function startTheGame() {
  generateStock();
  shuffleTiles();
  distributeDominoes();
  disableBtn("game-start", true);
  disableBtn("stock", true);
  if (!gamingBoard.length) {
    const initialTile = stock.shift();
    gamingBoard.unshift(initialTile);
    const leftNum = gamingBoard[0][0];
    const rightNum = gamingBoard[gamingBoard.length - 1][1];
    boardNumbers = [leftNum, rightNum];
    writeProcessOnBoard(`The game started. The board is <${gamingBoard}>`);
    console.log(`The game started. The board is <${gamingBoard}>`);
    player1.turn = true;
    document.getElementById("player2").classList.add("list--visibility");
  }
  updateStock();
}

// -- DONE --

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
      temporaryElement(
        `${player.name} can't play. They will draw a tile`,
        "alert_danger"
      );
      disableBtn("stock", false);
      return;
    } else {
      const gameOver = document.querySelector(".container_game-over");
      gameOver.style.display = "block";
    }
  }

  //in case of selecting the other persons tile
  const playerHasTile = player.hand.includes(selectedTile);

  if (!playerHasTile || selectedTile === undefined) {
    temporaryElement(
      `This is not your tile. Please select one from yours!`,
      "alert_danger"
    );

    return;
  }
  console.log(selectedTile);

  // in case of selectiing unplayable tile
  const isNoMatch =
    selectedTile[0] !== board[0] &&
    selectedTile[0] !== board[1] &&
    selectedTile[1] !== board[0] &&
    selectedTile[1] !== board[1];

  if (isNoMatch) {
    temporaryElement(
      "You cannot play this tile. Please select another one!",
      "alert_danger"
    );
    return;
  }

  if (selectedTile[0] === board[0] && selectedTile[0] === board[1]) {
    gamingBoard.push(selectedTile);
    player.hand.splice(inx, 1);
    updateList(player.name, player);
    console.log(
      `${player.name} played ${selectedTile}. The board is now ${gamingBoard}`
    );
  } else if (selectedTile[1] === board[0] && selectedTile[1] === board[1]) {
    gamingBoard.unshift(selectedTile);
    player.hand.splice(inx, 1);
    updateList(player.name, player);
    console.log(
      `${player.name} played ${selectedTile}. The board is now ${gamingBoard}`
    );
  } else if (selectedTile[0] === board[0] && selectedTile[0] !== board[1]) {
    const reversedTile = selectedTile.reverse();
    gamingBoard.unshift(reversedTile);
    player.hand.splice(inx, 1);
    updateList(player.name, player);
  } else if (selectedTile[0] === board[1] && selectedTile[0] !== board[0]) {
    gamingBoard.push(selectedTile);
    player.hand.splice(inx, 1);
    updateList(player.name, player);
  } else if (selectedTile[1] === board[0] && selectedTile[1] !== board[1]) {
    gamingBoard.unshift(selectedTile);
    player.hand.splice(inx, 1);
    updateList(player.name, player);
  } else if (selectedTile[1] === board[1] && selectedTile[1] !== board[0]) {
    const reversedTile = selectedTile.reverse();
    gamingBoard.push(reversedTile);
    player.hand.splice(inx, 1);
    updateList(player.name, player);
  }

  const boardItems = gamingBoard.map((item) => {
    return `<${item.toString().replace(",", ":")}>`;
  });

  setTimeout(() => {
    writeProcessOnBoard(`${player.name} played ${selectedTile}.`);
    writeProcessOnBoard(`The board is now ${boardItems}`);
  }, 100);

  if (!player.hand.length) {
    const gameOver = document.querySelector(".container-win");
    gameOver.style.display = "block";
  }

  if (player === player1) {
    player1.turn = false;
    player2.turn = true;
    document.getElementById("player1").classList.add("list--visibility");
    document.getElementById("player2").classList.remove("list--visibility");
  } else {
    player1.turn = true;
    player2.turn = false;
    document.getElementById("player2").classList.add("list--visibility");
    document.getElementById("player1").classList.remove("list--visibility");
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
  p.classList.add("board--game-process");
  p.innerText = content;
  boardDiv.insertAdjacentElement("beforeend", p);
}

function temporaryElement(text, alertType) {
  const infoContainer = document.querySelector(".container_info");
  const newDiv = document.createElement("div");
  newDiv.setAttribute("id", "inquirer");
  newDiv.classList.add(alertType);
  newDiv.innerText = text;

  infoContainer.appendChild(newDiv);
  setTimeout(function () {
    const tempDiv = document.getElementById("inquirer");
    tempDiv.remove();
  }, 3000);
}

function disableBtn(id, bool) {
  document.getElementById(id).disabled = bool;
}

// FIXME

function clicked_btn() {
  const question = document.querySelector(".container_question");
  const button = document.getElementById(this).value;
  console.log(button);
  // question.style.display = "none";
}

function drawATile() {
  const newTile = stock.shift();

  if (!stock.length) {
    const gameOver = document.querySelector(".container_game-over");
    gameOver.style.display = "block";
  }

  if (
    !newTile.includes(boardNumbers[0]) &&
    !newTile.includes(boardNumbers[1])
  ) {
    temporaryElement("Draw again", "alert_danger");
  } else {
    temporaryElement("You can play now.", "alert_success");
    disableBtn("stock", true);
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

function getTileValue(event) {
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
