import * as PIXI from "../pixi";
import mitt from "mitt";
import { TetrominoType, randomTetromino, rotate, unrotate } from "./tetromino";

const row = 20;
const col = 10;

const offsetTop = 2;
const offsetBottom = 0.5;

const palette: Record<TetrominoType, number> = {
  I: 0xcba6f7,
  O: 0xf38ba8,
  T: 0xfab387,
  S: 0xa6e3a1,
  Z: 0x94e2d5,
  J: 0x89b4fa,
  L: 0xf5c2e7,
};

export type GameEvent = {
  resize: {
    width: number;
    height: number;
    top: number;
    left: number;
    side: number;
  };
  clearRows: number;
  gameOver: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  moveDown: boolean;
  snapDown: boolean;
  rotate: boolean;
  levelChange: number;
};
export type Game = ReturnType<typeof createGame>;
export const createGame = () => {
  const pixiApp = new PIXI.Application<HTMLCanvasElement>({
    background: "#585b70",
  });

  const emitter = mitt<GameEvent>();

  let level = 1;

  const setLevel = (lv: number) => {
    level = lv;
    emitter.emit("levelChange", level);
  };

  let time = 0;
  let isPaused = false;

  pixiApp.ticker.add((deltaTime) => {
    time += deltaTime;

    if (time > Math.max(60 - (level - 1) * 4, 4)) {
      time = 0;
      moveDown();
      if (checkEnd()) {
        emitter.emit("gameOver", true);
        resetBoard();
        setLevel(1);
      }
      drawCurrent();
      drawBoard();
    }
  });

  let width = pixiApp.view.width;
  let height = pixiApp.view.height;

  let side = Math.min(height / (row + offsetBottom + offsetTop), width / col);
  let left = (width - col * side) / 2;
  let top =
    (height - (row + offsetTop + offsetBottom) * side) / 2 + offsetTop * side;

  const board = new Array(row);
  for (let i = 0; i < board.length; i++) {
    board[i] = new Array(col).fill(0);
  }

  const tetrominoQueue: { type: TetrominoType; shape: number[][] }[] = [];
  tetrominoQueue.push(randomTetromino());
  tetrominoQueue.push(randomTetromino());

  const current = {
    position: { x: 4, y: 0 },
    shape: [[]] as (0 | TetrominoType)[][],
  };

  const lines = new PIXI.Graphics();
  const nextGraphics = new PIXI.Graphics();
  const currentGraphics = new PIXI.Graphics();
  const shadowGraphics = new PIXI.Graphics();
  const boardGraphis = new PIXI.Graphics();

  shadowGraphics.alpha = 0.5;

  pixiApp.stage.addChild(lines);
  pixiApp.stage.addChild(nextGraphics);
  pixiApp.stage.addChild(currentGraphics);
  pixiApp.stage.addChild(shadowGraphics);
  pixiApp.stage.addChild(boardGraphis);

  drawLines();
  drawNext();
  resetCurrent();

  pixiApp.renderer.on("resize", (...params) => {
    width = pixiApp.view.width;
    height = pixiApp.view.height;
    console.log("renderer resize", params, width, height);

    side = Math.min(height / (row + offsetBottom + offsetTop), width / col);
    left = (width - col * side) / 2;
    top =
      (height - (row + offsetTop + offsetBottom) * side) / 2 + offsetTop * side;

    emitter.emit("resize", {
      width,
      height,
      top,
      left,
      side,
    });
    setTimeout(() => {
      drawLines();
      drawBoard();
      drawCurrent();
      drawNext();
    });
  });

  function resetCurrent() {
    const tetromino = tetrominoQueue.shift()!;
    tetrominoQueue.push(randomTetromino());
    current.position = { x: 4, y: 0 };
    current.shape = tintShape(tetromino.shape, tetromino.type);

    drawNext();
  }

  function tintShape(shape: number[][], type: TetrominoType) {
    return shape.map((row) => row.map((v) => (v === 1 ? type : 0)));
  }

  function drawLines() {
    lines.clear();
    lines.lineStyle(2, 0x7f849c);

    for (let i = 0; i < row + 1; i++) {
      lines.moveTo(left, i * side + top);
      lines.lineTo(left + col * side, i * side + top);
    }
    for (let i = 0; i < col + 1; i++) {
      lines.moveTo(left + i * side, top);
      lines.lineTo(left + i * side, top + row * side);
    }
  }

  function drawNext() {
    const panelTop = top - 2 * side + 4;
    const panelLeft = left + side * 6;
    const panelWidth = side * 4;
    const panelHeight = side * 2 - 8;
    const nextSide = side * 0.5;
    nextGraphics.clear();
    const next = tetrominoQueue[0];

    const shapeWidth =
      next.shape
        .reduce(
          (r1, r2) => r1.map((v, i) => v + r2[i]),
          new Array(next.shape[0].length).fill(0),
        )
        .reduce((a, b) => a + (b ? 1 : 0), 0) * nextSide;

    let shapeOffsetY = 0;

    const rowSum = next.shape.map((row) => row.reduce((a, b) => a + b, 0));

    for (let i = 0; i < rowSum.length; i++) {
      if (rowSum[i]) break;
      shapeOffsetY++;
    }

    const colSum = rotate(next.shape).map(
      (col) => col.reduce((a, b) => a + b),
      0,
    );

    let shapeOffsetX = 0;

    for (let i = 0; i < colSum.length; i++) {
      if (colSum[i]) break;
      shapeOffsetX++;
    }

    const shapeHeight =
      next.shape
        .map((row) => row.reduce((a, b) => a + b, 0))
        .reduce((a, b) => a + (b ? 1 : 0), 0) * nextSide;

    nextGraphics.lineStyle(2, 0x7f849c);
    nextGraphics.drawRect(panelLeft, panelTop, panelWidth, panelHeight);
    for (let i = 0; i < next.shape.length; i++) {
      for (let j = 0; j < next.shape[i].length; j++) {
        if (next.shape[i][j]) {
          nextGraphics.beginFill(palette[next.type]);
          nextGraphics.drawRect(
            panelLeft +
              (panelWidth - shapeWidth) / 2 +
              (j - shapeOffsetX) * nextSide,
            panelTop +
              (panelHeight - shapeHeight) / 2 +
              (i - shapeOffsetY) * nextSide,
            nextSide,
            nextSide,
          );
        }
      }
    }
  }

  function checkCollision(
    shape: (number | TetrominoType)[][],
    position: { x: number; y: number },
  ) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (
          shape[y][x] &&
          board[y + position.y] &&
          board[y + position.y][x + position.x]
        ) {
          return true;
        }
        if (shape[y][x] && y + position.y === row) {
          return true;
        }
      }
    }
    return false;
  }
  function checkCurrentCollision() {
    const { shape, position } = current;
    return checkCollision(shape, position);
  }
  function checkOutsideWalls() {
    for (let y = 0; y < current.shape.length; y++) {
      for (let x = 0; x < current.shape[y].length; x++) {
        if (current.shape[y][x] && x + current.position.x < 0) {
          return true;
        }
        if (current.shape[y][x] && x + current.position.x >= col) {
          return true;
        }
      }
    }
    return false;
  }

  function merge() {
    for (let y = 0; y < current.shape.length; y++) {
      for (let x = 0; x < current.shape[y].length; x++) {
        if (current.shape[y][x]) {
          board[y + current.position.y][x + current.position.x] =
            current.shape[y][x];
        }
      }
    }
  }

  function resetBoard() {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        board[i][j] = 0;
      }
    }
  }

  function checkEnd() {
    if (board[0].find((v: number) => v)) {
      return true;
    }
    return false;
  }

  function clearRows() {
    let rows = 0;
    let i = board.length - 1;
    while (i > 0) {
      if (board[i].every((v: number) => v)) {
        board.splice(i, 1);
        board.unshift(new Array(col).fill(0));
        rows++;
      } else {
        i--;
      }
    }
    return rows;
  }

  function moveLeft() {
    if (isPaused) return;
    current.position.x -= 1;
    const failed = checkOutsideWalls() || checkCurrentCollision();
    if (failed) {
      current.position.x += 1;
    }
    emitter.emit("moveLeft", !failed);
    return !failed;
  }
  function moveRight() {
    if (isPaused) return;
    current.position.x += 1;
    const failed = checkOutsideWalls() || checkCurrentCollision();
    if (failed) {
      current.position.x -= 1;
    }
    emitter.emit("moveRight", !failed);
    return !failed;
  }
  function moveDown() {
    if (isPaused) return;
    current.position.y += 1;
    const isCollision = checkCurrentCollision();
    if (isCollision) {
      current.position.y -= 1;
      merge();
      const rows = clearRows();
      if (rows) {
        emitter.emit("clearRows", rows);
      }

      resetCurrent();

      if (checkEnd() || checkCurrentCollision()) {
        emitter.emit("gameOver", true);
        setLevel(1);
        resetBoard();
      }

      drawBoard();

      time = 0;
    }
    return isCollision;
  }

  function snapDown() {
    if (isPaused) return;
    while (!moveDown()) {
      // do nothing
    }
    emitter.emit("snapDown", true);
  }

  function rotateCurrent() {
    if (isPaused) return;
    let success = true;
    current.shape = rotate(current.shape);
    if (checkOutsideWalls() || checkCurrentCollision()) {
      if (moveLeft()) {
        // do nothing
      } else if (moveRight()) {
        // do nothing
      } else {
        current.shape = unrotate(current.shape);
        success = false;
      }
    }
    emitter.emit("rotate", success);
  }

  function drawCurrent() {
    currentGraphics.clear();
    current.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          renderBlock(
            currentGraphics,
            value as TetrominoType,
            current.position.y + y,
            current.position.x + x,
          );
        }
      });
    });
    const shadowShape = current.shape.map((row) => row.map((v) => v));
    const shadowPosition = {
      x: current.position.x,
      y: current.position.y,
    };
    do {
      shadowPosition.y += 1;
    } while (!checkCollision(shadowShape, shadowPosition));
    shadowPosition.y -= 1;
    shadowGraphics.clear();
    shadowShape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          shadowGraphics.beginFill(palette[value], 0.5);
          shadowGraphics.lineStyle(2, 0x7f849c);
          shadowGraphics.drawRect(
            left + (shadowPosition.x + x) * side,
            top + (shadowPosition.y + y) * side,
            side,
            side,
          );
        }
      });
    });
  }

  function renderBlock(
    graphis: PIXI.Graphics,
    value: TetrominoType,
    y: number,
    x: number,
  ) {
    graphis.beginFill(palette[value]);
    graphis.lineStyle(2, 0x7f849c);
    graphis.drawRect(left + x * side, top + y * side, side, side);
  }

  function drawBoard() {
    boardGraphis.clear();

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j]) {
          renderBlock(boardGraphis, board[i][j], i, j);
        }
      }
    }
  }

  function on<T extends keyof GameEvent>(
    event: T,
    callback: (args: GameEvent[T]) => void,
  ) {
    emitter.on(event, callback);
  }

  function off<T extends keyof GameEvent>(
    event: T,
    callback: (args: GameEvent[T]) => void,
  ) {
    emitter.off(event, callback);
  }

  function destory() {
    pixiApp.destroy(true);
  }

  function pause() {
    pixiApp.ticker?.stop();
    isPaused = true;
  }
  function resume() {
    pixiApp.ticker?.start();
    isPaused = false;
  }

  return {
    pixiApp,
    top,
    left,
    side,
    moveLeft,
    moveRight,
    moveDown: () => {
      if (isPaused) return;
      const success = !!moveDown();
      emitter.emit("moveDown", success);
    },
    snapDown,
    rotateCurrent,
    drawCurrent,
    on,
    off,
    destory,
    pause,
    resume,
    isPaused,
    level,
    setLevel,
  };
};
