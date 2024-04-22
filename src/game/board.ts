export const row = 20;
export const col = 10;
export const board = new Array(row);

for (let i = 0; i < board.length; i++) {
  board[i] = new Array(col).fill(0);
}

export const resetBoard = () => {
  console.log("reset board");
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      board[i][j] = 0;
    }
  }
};

export const clearRows = () => {
  let n = 0;
  let i = board.length - 1;
  while (i > 0) {
    if (board[i].every((v: number) => v)) {
      board.splice(i, 1);
      board.unshift(new Array(col).fill(0));
      n++;
    } else {
      i--;
    }
  }
  return n;
};
