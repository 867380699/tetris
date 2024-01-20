export const tetrominoType = {
  I: "I",
  J: "J",
  L: "L",
  O: "O",
  S: "S",
  T: "T",
  Z: "Z",
};

export type TetrominoType = keyof typeof tetrominoType;

const tetrominoTypes: TetrominoType[] = ["I", "J", "L", "O", "S", "T", "Z"];

export const tetrominoShape: Record<TetrominoType, number[][]> = {
  I: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  J: [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
  L: [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

export const randomTetromino = () => {
  const type: TetrominoType =
    tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
  return {
    type,
    shape: tetrominoShape[type],
  };
};
export const rotate = <T>(tetromino: T[][]) => {
  return tetromino[0].map((_, index) =>
    tetromino.map((row) => row[index]).reverse(),
  );
};
export const unrotate = <T>(tetromino: T[][]) => {
  return tetromino[0].map((_, index) =>
    tetromino.map((row) => row[row.length - 1 - index]),
  );
};
