var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
let mouse = {
  mouseX: undefined,
  mouseY: undefined,
};
let mouseHover = {
  mouseX: undefined,
  mouseY: undefined,
};
let tileHeight = 55;
let tileWidth = 55;
let rows = 8;
let cols = 8;
let selectedIndex;
let hoveredIndex;
let turn = 1;
let score1 = 0;
let score2 = 0;
let moves = [];
let oppMoves = [];
let board = [];
let forfeit = 0;

let bot = 1;
let bot2 = 2;

let botOn = false;
let bot1Score = 0;
let bot2Score = 0;
let slow = false;

let mouseIndex = document.getElementById("mouseIndex");
let score1Count = document.getElementById("botscore1");
let score2Count = document.getElementById("botscore2");
let player1Score = document.getElementById("score1");
let player2Score = document.getElementById("score2");

document.addEventListener("mousemove", function (e) {
  mouseHover.mouseX = e.clientX;
  mouseHover.mouseY = e.clientY;
  document.addEventListener("mousedown", function () {
    mouse.mouseX = e.clientX;
    mouse.mouseY = e.clientY;
  });
});

let Moves = class {
  constructor(move, orgin, jump, double, jumpIndex) {
    this.move = move;
    this.orgin = orgin;
    this.jumpIndex = jumpIndex;
    this.jump = jump;
    this.double = double;
  }
};

class Tile {
  constructor(x, y, color, peice, index, row, col) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.peice = peice;
    this.isSelected = false;
    this.index = index;
    this.row = row;
    this.col = col;
    this.king = false;
    this.computed = false;
    this.computed2 = false;

    this.draw = () => {
      context.fillStyle = this.color == 0 ? "black" : "white";
      context.fillRect(this.x, this.y, tileWidth, tileHeight);
      if (this.peice == 2 || this.peice == 1) {
        this.peiceColor =
          this.peice == 1 ? "red" : this.peice == 2 ? "blue" : "transparent";
        context.fillStyle = this.peiceColor;
        context.moveTo(this.x, this.y);
        context.beginPath();
        context.arc(
          this.x + tileWidth / 2,
          this.y + tileHeight / 2,
          tileWidth / 2 - 1,
          0,
          2 * Math.PI
        );
        context.closePath();
        context.fill();
      }
      if (this.king) {
        context.strokeStyle = "black";
        context.moveTo(this.x, this.y);
        context.beginPath();
        context.arc(
          this.x + tileWidth / 2,
          this.y + tileHeight / 2,
          tileWidth / 2 - 10,
          0,
          2 * Math.PI
        );
        context.arc(
          this.x + tileWidth / 2,
          this.y + tileHeight / 2,
          tileWidth / 2 - 20,
          0,
          2 * Math.PI
        );
        context.closePath();
        context.stroke();
      }
      if (checkIfMove(this.index)) {
        context.fillStyle = "grey";
        context.moveTo(this.x, this.y);
        context.beginPath();
        context.arc(
          this.x + tileWidth / 2,
          this.y + tileHeight / 2,
          tileWidth / 4,
          0,
          2 * Math.PI
        );
        context.closePath();
        context.fill();
      }
    };
    this.update = () => {
      if (
        mouse.mouseX > this.x &&
        mouse.mouseX < this.x + tileWidth &&
        mouse.mouseY > this.y &&
        mouse.mouseY <= this.y + tileHeight &&
        selectedIndex != index &&
        (this.peice == turn || this.peice == 0)
      ) {
        this.isSelected = true;

        if (checkIfOrgin(this.index)) {
          selectedIndex = this.index;
        }
      } else {
        this.isSelected = false;
      }

      if (this.isSelected == true) {
        let check = checkIfMove(this.index);
        if (check.true && this.peice == 0) {
          movePeice(moves[check.index]);
          selectedIndex = undefined;
          moves = [];
        }
      }
      if (this.peice == turn && !this.computed) {
        let moveRow = this.peice == 2 ? this.row - 1 : this.row + 1;
        let oppRow = this.peice == 2 ? this.row + 1 : this.row - 1;

        let moveIndex1 = moveRow * cols + (this.col - 1);
        let moveIndex2 = moveRow * cols + (this.col + 1);
        let moveIndex3 = oppRow * cols + (this.col - 1);
        let moveIndex4 = oppRow * cols + (this.col + 1);
        moves.push(
          checkTile(
            moveIndex1,
            moveRow,
            this.col - 1,
            this.peice,
            "left",
            false,
            this.index
          )
        );
        moves.push(
          checkTile(
            moveIndex2,
            moveRow,
            this.col + 1,
            this.peice,
            "right",
            false,
            this.index
          )
        );
        if (this.king) {
          moves.push(
            checkTile(
              moveIndex3,
              oppRow,
              this.col - 1,
              this.peice == 1 ? 2 : 1,
              "left",
              true,
              this.index
            )
          );
          moves.push(
            checkTile(
              moveIndex4,
              oppRow,
              this.col + 1,
              this.peice == 1 ? 2 : 1,
              "right",
              true,
              this.index
            )
          );
        }
        this.computed = true;
      } else if (this.peice != turn && this.computed) {
        this.computed = false;
      } else if (this.peice != turn && !this.computed2 && this.peice != 0) {
        let moveRow = this.peice == 2 ? this.row - 1 : this.row + 1;
        let oppRow = this.peice == 2 ? this.row + 1 : this.row - 1;

        let moveIndex1 = moveRow * cols + (this.col - 1);
        let moveIndex2 = moveRow * cols + (this.col + 1);
        let moveIndex3 = oppRow * cols + (this.col - 1);
        let moveIndex4 = oppRow * cols + (this.col + 1);
        oppMoves.push(
          checkTile(
            moveIndex1,
            moveRow,
            this.col - 1,
            this.peice,
            "left",
            false,
            this.index
          )
        );
        oppMoves.push(
          checkTile(
            moveIndex2,
            moveRow,
            this.col + 1,
            this.peice,
            "right",
            false,
            this.index
          )
        );
        if (this.king) {
          oppMoves.push(
            checkTile(
              moveIndex3,
              oppRow,
              this.col - 1,
              this.peice == 1 ? 2 : 1,
              "left",
              true,
              this.index
            )
          );
          oppMoves.push(
            checkTile(
              moveIndex4,
              oppRow,
              this.col + 1,
              this.peice == 1 ? 2 : 1,
              "right",
              true,
              this.index
            )
          );
        }
        this.computed2 = true;
      } else if (this.peice == turn) {
        this.computed2 = false;
      }
      if (
        mouseHover.mouseX > this.x &&
        mouseHover.mouseX < this.x + tileWidth &&
        mouseHover.mouseY > this.y &&
        mouseHover.mouseY <= this.y + tileHeight
      ) {
        hoveredIndex = this.index;
      }
      if (
        this.row == (this.peice == 1 ? rows - 1 : this.peice == 2 ? 0 : null) &&
        !this.king
      ) {
        this.king = true;
      }
      this.draw();
    };
    this.updatePeice = (newPeice, king) => {
      this.peice = newPeice;
      this.isSelected = false;
      this.king = king;
    };
  }
}

//generate board
const generateBoard = () => {
  board = [];
  selectedIndex = undefined;
  turn = 1;
  score1 = 0;
  score2 = 0;
  moves = [];
  oppMoves = [];
  forfeit = 0;

  let color;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let player = 0;

      let index = cols * row + col;
      if (index == 0 || (board[index - 1].color == 0 && col != 0)) {
        color = 1;
      } else if (row % 2 == 0 && col == 0) {
        color = 1;
      } else {
        color = 0;
        if (row <= 2) {
          player = 1;
        } else if (row >= 5) {
          player = 2;
        }
      }
      board.push(
        new Tile(
          col * tileWidth,
          row * tileHeight,
          color,
          player,
          index,
          row,
          col
        )
      );
    }
  }
};
generateBoard();
console.log(board);

//animation frames
const animation = () => {
  requestAnimationFrame(animation);
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let index = cols * row + col;
      board[index].update(index, row, col);
    }
  }
  if (botOn) {
    if (slow) {
      if (turn == bot) {
        setTimeout(botMove, 500);
      } else {
        setTimeout(botMove2, 500);
      }
    } else {
      if (turn == bot) {
        botMove();
      } else {
        botMove2();
      }
    }
  }
  if (hoveredIndex != null) {
    mouseIndex.innerHTML = hoveredIndex;
  }
  if (score1 >= 12 || forfeit == bot2) {
    bot1Score += 1;
    console.log("bot1 win", bot1Score);
    generateBoard();
  } else if (score2 >= 12 || forfeit == bot) {
    bot2Score += 1;
    console.log("bot2 win", bot2Score);

    generateBoard();
  }

  score1Count.innerHTML = bot1Score;
  score2Count.innerHTML = bot2Score;
  player1Score.innerHTML = score1;
  player2Score.innerHTML = score2;
};

//functions

//tile checking
const checkTile = (index, row, col, orgin, dir, king, orginIndex) => {
  let nextRow;
  let nextCol;
  let nextPeice;
  if (isInBounds(row, col)) {
    if (
      board[index].peice > 0 && !king
        ? board[index].peice != orgin
        : board[index].peice == orgin
    ) {
      nextRow = orgin == 2 ? row - 1 : row + 1;

      nextCol = dir == "left" ? col - 1 : col + 1;
      nextPeice = cols * nextRow + nextCol;
      if (isInBounds(nextRow, nextCol)) {
        if (board[nextPeice].peice > 0) {
          return null;
        } else {
          //check for double move
          doubleRight = checkForDoubleMove(
            orgin == 2 ? nextRow - 1 : nextRow + 1,
            nextCol + 1,
            orgin,
            "right"
          );
          doubleLeft = checkForDoubleMove(
            orgin == 2 ? nextRow - 1 : nextRow + 1,
            nextCol - 1,
            orgin,
            "left"
          );

          if (doubleRight != null || doubleLeft != null) {
            if (doubleRight != null) {
              return new Moves(doubleRight.move, orginIndex, true, true, [
                index,
                doubleRight.jumped,
              ]);
            } else if (doubleLeft != null) {
              return new Moves(doubleLeft.move, orginIndex, true, true, [
                index,
                doubleLeft.jumped,
              ]);
            }
          } else {
            return new Moves(nextPeice, orginIndex, true, false, index);
          }
        }
      } else {
        return null;
      }
    } else if (board[index].peice == 0) {
      return new Moves(index, orginIndex, false, false, null);
    } else {
      return null;
    }
  } else {
    return null;
  }
};
const checkForDoubleMove = (row, col, orgin, dir) => {
  let index = cols * row + col;
  if (index < cols * rows) {
    if (col >= 0 && col <= cols - 1 && row <= rows - 1 && row >= 0) {
      if (board[index].peice > 0 && board[index].peice != orgin) {
        let doubleRow = orgin == 2 ? row - 1 : row + 1;
        let doubleCol = dir == "left" ? col - 1 : col + 1;
        let doublePiece = cols * doubleRow + doubleCol;
        if (isInBounds(doubleRow, doubleCol)) {
          if (board[doublePiece]?.peice > 0) {
            return null;
          } else {
            return { move: doublePiece, jumped: index };
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
};
//move should be a Move object  --- let Moves: new (move: any, orgin: any, jump: any, jumpIndex: any) => Moves

const movePeice = (move) => {
  if (move != undefined) {
    let orgin = move.orgin;
    let moveI = move.move;

    let player = board[orgin].peice;
    let king = board[orgin].king;

    //set tile to zero

    board[orgin].updatePeice(0, false);
    //moves the tiles value to the intended tile

    board[moveI].updatePeice(player == 1 ? 1 : 2, king);
    if (move.jump) {
      let type = typeof move.jumpIndex == "object";
      if (type) {
        for (let i = 0; i < move.jumpIndex.length; i++) {
          board[move.jumpIndex[i]].updatePeice(0, false);
        }
      } else {
        board[move.jumpIndex].updatePeice(0, false);
      }
      if (turn == 1) {
        score1 += type ? move.jumpIndex.length : 1;
      } else {
        score2 += type ? move.jumpIndex.length : 1;
      }
    }

    moves = [];
    oppMoves = [];

    turn = turn == 1 ? 2 : 1;
  }
};

//checks if a move is a valid move in the the move array

const botMove = () => {
  if (turn == bot) {
    let randMove = undefined;
    let validMoves = [];
    let oppJumps = [];
    let risk = [];
    let jumps = checkForJumps();

    for (let i = 0; i < moves.length; i++) {
      if (moves[i] != null) {
        validMoves.push(i);
      }
    }

    for (let i = 0; i < oppMoves.length; i++) {
      if (oppMoves[i]?.jump) {
        oppJumps.push(oppMoves[i].move);
      }
    }
    //check for jumps

    if (jumps.length > 0) {
      let doubleJumps = [];
      jumps.forEach((move) => {
        if (moves[move].double == true) {
          doubleJumps.push(move);
        }
      });
      //check for double jumps
      if (doubleJumps.length > 0) {
        randMove = doubleJumps[Math.floor(doubleJumps.length * Math.random())];
      } else {
        randMove = jumps[Math.floor(jumps.length * Math.random())];
      }
    } else if (oppJumps.length > 0) {
      //blocking
      for (let i = 0; i < validMoves.length; i++) {
        if (oppJumps.includes(moves[validMoves[i]].move)) {
          randMove = validMoves[i];
        }
      }

      if (randMove == undefined) {
        randMove = validMoves[Math.floor(validMoves.length * Math.random())];
      }
    } else {
      risk = [];
      let riskI = [];
      let ovrRisk = 0;
      let moveDiff = [];
      for (let i = 0; i < board.length; i++) {
        if (board[i].peice == bot) {
          let score = scoreMove(i);
          risk.push(score);
          riskI.push(i);
          ovrRisk += score;
        }
      }
      console.log(risk, riskI, ovrRisk);
      for (let i = 0; i < validMoves.length; i++) {
        let move = moves[validMoves[i]];
        let before = risk[riskI.indexOf(move.orgin)];
        let after = scoreMove(move.move);
        //before + x == after
        //after - before = x
        moveDiff.push(after - before);
      }
      let min = Math.min(...moveDiff);
      let bestMove = moveDiff.indexOf(min);
      console.log(moveDiff, min, bestMove);

      randMove = validMoves[bestMove];
    }

    if (validMoves.length == 0) {
      forfeit = bot;
      return;
    } else {
      console.log(moves[randMove]);
      movePeice(moves[randMove]);
    }
  }
};
const botMove2 = () => {
  if (turn == bot2) {
    let randMove = undefined;
    let validMoves = [];
    let oppJumps = [];
    let jumps = checkForJumps();

    for (let i = 0; i < moves.length; i++) {
      if (moves[i] != null) {
        validMoves.push(i);
      }
    }

    for (let i = 0; i < oppMoves.length; i++) {
      if (oppMoves[i]?.jump) {
        oppJumps.push(oppMoves[i].move);
      }
    }

    if (jumps.length > 0) {
      randMove = jumps[Math.floor(jumps.length * Math.random())];
    } else if (oppJumps.length > 0) {
      for (let i = 0; i < validMoves.length; i++) {
        if (oppJumps.includes(moves[validMoves[i]].move)) {
          randMove = validMoves[i];
        }
      }
      if (randMove == undefined) {
        randMove = validMoves[Math.floor(validMoves.length * Math.random())];
      }
    } else {
      randMove = validMoves[Math.floor(validMoves.length * Math.random())];
    }
    if (validMoves.length == 0) {
      forfeit = bot2;
      return;
    } else {
      movePeice(moves[randMove]);
    }
  }
};

const checkIfMove = (index) => {
  let manditioryJump = checkForJumps();
  for (let i = 0; i < moves.length; i++) {
    if (index == moves[i]?.move && selectedIndex == moves[i]?.orgin) {
      const r = { true: true, index: i };
      if (manditioryJump.length > 0) {
        if (manditioryJump.includes(i)) {
          return r;
        } else {
          return false;
        }
      } else {
        return r;
      }
    }
  }
  return false;
};
const checkIfOrgin = (index) => {
  for (let i = 0; i < moves.length; i++) {
    if (index == moves[i]?.orgin) {
      return true;
    }
  }
  return false;
};
const checkForJumps = () => {
  let manditioryJumps = [];
  for (let i = 0; i < moves.length; i++) {
    if (moves[i]?.jump) {
      manditioryJumps.push(i);
    }
  }

  return manditioryJumps;
};
const isInBounds = (row, col) => {
  return row >= 0 && row < rows && col >= 0 && col < cols;
};
const findSurroundings = (index) => {
  const row = board[index].row;
  const col = board[index].col;

  const offsets = [
    [-1, -1], // Top-left
    [-1, 1], // Top-right
    [1, -1], // Bottom-left
    [1, 1], // Bottom-right
  ];

  const surrounding = offsets.map(([rowOffset, colOffset]) => {
    const nextRow = row + rowOffset;
    const nextCol = col + colOffset;

    if (isInBounds(nextRow, nextCol)) {
      return nextRow * cols + nextCol;
    }
    return null;
  });

  return surrounding;
};

//move obj constructer (move: any, orgin: any, jump: any, double: any, jumpIndex)
// testing move == index
const scoreMove = (move) => {
  let moveScore = 0;
  let orginRisk = 0;
  let orginSurrounding = findSurroundings(move);
  //let moveSurrounding = findSurroundings(move.move);
  console.log(orginSurrounding);
  orginSurrounding.forEach((tile, i) => {
    let value = board[tile]?.peice;

    orginSurrounding[i] = value == undefined ? -1 : value;
  });
  let topLeft = orginSurrounding[0];
  let topRight = orginSurrounding[1];
  let bottomLeft = orginSurrounding[2];
  let bottomRight = orginSurrounding[3];
  // going to be jumped
  if (
    (topLeft != turn && topLeft != 0 && bottomRight == 0) ||
    (bottomLeft != turn && topLeft != 0 && topRight == 0)
  ) {
    orginRisk += 2;
  }
  // bordered by wall
  else if (
    topLeft == -1 ||
    topRight == -1 ||
    bottomLeft == -1 ||
    bottomRight == -1
  ) {
    orginRisk -= 2;
  }

  return orginRisk;
};

// saves
const saveGame = () => {
  let date = new Date();
  const save = JSON.stringify({
    board: board,
    score1: score1,
    score2: score2,
    turn: turn,
  });
  const blob = new Blob([save], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  let download = document.createElement("a");
  download.href = url;
  download.download = "save" + date.toLocaleDateString() + ".json";
  download.click();
};
const importSave = () => {
  let input = document.createElement("input");
  let parsed;
  input.setAttribute("type", "file");
  input.click();
  input.addEventListener("change", (e) => {
    let file = e.target.files[0];

    let reader = new FileReader();

    reader.onload = (e) => {
      parsed = JSON.parse(e.target.result);
      score1 = parsed.score1;
      score2 = parsed.score2;
      turn = parsed.turn;
      board.forEach((tile, index) => {
        tile.updatePeice(parsed.board[index].peice, parsed.board[index].king);
      });
    };
    reader.readAsText(file);
    findSurroundings(board, 40);
  });
};

animation();
