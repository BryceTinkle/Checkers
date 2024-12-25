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
let player1Score = document.getElementById("score1");
let player2Score = document.getElementById("score2");
let turnDisplay = document.getElementById("turn");
let mouseIndex = document.getElementById("mouseIndex");

document.addEventListener("mousemove", function (e) {
  mouseHover.mouseX = e.clientX;
  mouseHover.mouseY = e.clientY;
  document.addEventListener("mousedown", function () {
    mouse.mouseX = e.clientX;
    mouse.mouseY = e.clientY;
  });
});

let moves = {
  move1: undefined,
  move2: undefined,
  move3: undefined,
  move4: undefined,
  orgin: undefined,
  jumpIndex: [],
  jump: false,
  nextmoves: [],
  doubleIndex: [],
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
        //context.beginPath();
        context.arc(
          this.x + tileWidth / 2,
          this.y + tileHeight / 2,
          tileWidth / 2 - 1,
          0,
          2 * Math.PI
        );
        //context.closePath();
        context.stroke();
      }
      if (
        this.index == moves.move1 ||
        this.index == moves.move2 ||
        this.index == moves.move3 ||
        this.index == moves.move4
      ) {
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
    this.update = (index, row, col) => {
      if (
        mouse.mouseX > this.x &&
        mouse.mouseX < this.x + tileWidth &&
        mouse.mouseY > this.y &&
        mouse.mouseY <= this.y + tileHeight &&
        selectedIndex != index &&
        (this.peice == turn || this.peice == 0)
      ) {
        selectedIndex = index;
        this.isSelected = true;
      } else {
        this.isSelected = false;
      }

      if (this.isSelected == true) {
        if (
          (index == moves.move1 ||
            index == moves.move2 ||
            index == moves.move3 ||
            index == moves.move4) &&
          this.peice == 0
        ) {
          movePeice(moves.orgin, index);

          selectedIndex = undefined;
        } else if (this.peice > 0) {
          let moveRow = this.peice == 2 ? row - 1 : row + 1;
          let oppRow = this.peice == 2 ? row + 1 : row - 1;

          let moveIndex1 = moveRow * cols + (col - 1);
          let moveIndex2 = moveRow * cols + (col + 1);
          let moveIndex3 = oppRow * cols + (col - 1);
          let moveIndex4 = oppRow * cols + (col + 1);

          moves.orgin = index;
          moves.move1 = checkTile(
            moveIndex1,
            moveRow,
            col - 1,
            this.peice,
            "left",
            false
          );
          moves.move2 = checkTile(
            moveIndex2,
            moveRow,
            col + 1,
            this.peice,
            "right",
            false
          );
          if (this.king) {
            console.log(this.peice == 1 ? 2 : 1);
            moves.move3 = checkTile(
              moveIndex3,
              oppRow,
              col - 1,
              this.peice == 1 ? 2 : 1,
              "left",
              true
            );
            moves.move4 = checkTile(
              moveIndex4,
              oppRow,
              col + 1,
              this.peice == 1 ? 2 : 1,
              "right",
              true
            );
          } else {
            moves.move3 = undefined;
            moves.move4 = undefined;
          }
          console.log(moves);
        }
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

let board = [];
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
console.log(board);
function animation() {
  if (score1 < 12 && score2 < 12) {
    requestAnimationFrame(animation);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let index = cols * row + col;
        board[index].update(index, row, col);
      }
    }
    if (hoveredIndex != null) {
      mouseIndex.innerHTML = hoveredIndex;
    }
    turnDisplay.innerHTML = turn == 1 ? "Red Turn" : "Blue Turn";
  } else {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    turnDisplay.innerHTML = score1 == 12 ? "Red Win" : "Blue Win";
  }
}
function checkTile(index, row, col, orgin, dir, king) {
  console.log(index, row, col, orgin, dir);
  let nextRow;
  let nextCol;
  let nextPeice;
  if (col >= 0 && col <= cols - 1 && row <= rows - 1 && row >= 0) {
    console.log("pass 1", board[index].peice, orgin);

    if (
      board[index].peice > 0 && !king
        ? board[index].peice != orgin
        : board[index].peice == orgin
    ) {
      console.log("pass 2");

      if (king) {
        nextRow = orgin == 1 ? row + 1 : row - 1;
        console.log(nextRow, "nextrow");
      } else {
        nextRow = orgin == 2 ? row - 1 : row + 1;
      }
      nextCol = dir == "left" ? col - 1 : col + 1;
      nextPeice = cols * nextRow + nextCol;
      console.log(nextPeice);
      if (
        nextCol >= 0 &&
        nextCol <= cols - 1 &&
        nextRow <= rows - 1 &&
        nextRow >= 0
      ) {
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
            moves.jump = true;
            if (doubleRight != null) {
              moves.jumpIndex.push(index);

              moves.nextmoves.push(doubleRight);
              console.log(moves);

              return doubleRight;
            } else if (doubleLeft != null) {
              moves.jumpIndex.push(index);

              moves.nextmoves.push(doubleLeft);
              console.log(moves);

              return doubleLeft;
            } else {
              moves.jumpIndex.push(index);

              moves.nextmoves.push(doubleRight);
              moves.nextmoves.push(doubleLeft);
              moves.move3 = doubleLeft;
              console.log(moves);

              return doubleRight;
            }
          } else {
            moves.jump = true;
            moves.jumpIndex.push(index);
            moves.nextmoves.push(nextPeice);
            moves.double = false;
            return nextPeice;
          }
        }
      } else {
        return null;
      }
    } else if (board[index].peice == 0) {
      return index;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
function checkForDoubleMove(row, col, orgin, dir) {
  let index = cols * row + col;
  if (index < cols * rows) {
    if (col >= 0 && col <= cols - 1 && row <= rows - 1 && row >= 0) {
      if (board[index].peice > 0 && board[index].peice != orgin) {
        let doubleRow = orgin == 2 ? row - 1 : row + 1;
        let doubleCol = dir == "left" ? col - 1 : col + 1;
        let doublePiece = cols * doubleRow + doubleCol;
        if (
          doubleCol > 0 &&
          doubleCol < cols - 1 &&
          doubleRow <= rows &&
          doubleRow >= 0
        ) {
          if (board[doublePiece].peice > 0) {
            return null;
          } else {
            moves.doubleIndex.push(index);
            return doublePiece;
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
}

function movePeice(orgin, move) {
  let player = board[orgin].peice;
  let king = board[orgin].king;

  let included = false;
  let includedDouble = false;
  let nextMoveIndex;

  //set tile to zero
  board[orgin].updatePeice(0, false);
  //moves the tiles value to the intended tile
  board[move].updatePeice(player == 1 ? 1 : 2, king);
  if (moves.jump) {
    //checks if we are making a jump
    for (let i = 0; i < moves.nextmoves.length; i++) {
      if (moves.nextmoves[i] == move) {
        nextMoveIndex = i;
        included = true;
      }
    }
    if (moves.doubleIndex.length > 0) {
      includedDouble = true;
    }

    if (included) {
      if (includedDouble) {
        board[moves.jumpIndex[nextMoveIndex]].updatePeice(0, false);
        board[moves.doubleIndex[nextMoveIndex]].updatePeice(0, false);
        if (turn == 1) {
          score1 += 2;
        } else {
          score2 += 2;
        }
      } else {
        board[moves.jumpIndex[nextMoveIndex]].updatePeice(0, false);
        if (turn == 1) {
          score1 += 1;
        } else {
          score2 += 1;
        }
      }
    }
  }
  moves.move1 = undefined;
  moves.move2 = undefined;
  moves.move3 = undefined;
  moves.move4 = undefined;
  moves.orgin = undefined;
  moves.jump = false;
  moves.nextmoves = [];
  moves.doubleIndex = [];
  moves.jumpIndex = [];
  turn = turn == 1 ? 2 : 1;

  player1Score.innerHTML = score1;
  player2Score.innerHTML = score2;
}
animation();
