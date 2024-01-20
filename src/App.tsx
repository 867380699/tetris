import { useEffect, useRef } from "react";
// import './App.css'
import * as PIXI from "pixi.js";
import { TetrominoType, randomTetromino, rotate, unrotate } from "./tetromino";

function App() {
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const pixiApp = new PIXI.Application<HTMLCanvasElement>({
      background: "#585b70",
      resizeTo: window,
    });

    const row = 20;
    const col = 10;

    let width = pixiApp.view.width;
    let height = pixiApp.view.height;
    let side = Math.min(height / row, width / col);
    let left = (width - col * side) / 2;
    let top = (height - row * side) / 2;

    const lines = new PIXI.Graphics();

    pixiApp.stage.addChild(lines);

    const drawLines = () => {
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
    };
    drawLines();

    window.addEventListener("resize", () => {
      setTimeout(() => {
        width = pixiApp.view.width;
        height = pixiApp.view.height;
        side = Math.min(height / row, width / col);
        left = (width - col * side) / 2;
        top = (height - row * side) / 2;
        drawLines();
        drawBoard();
        drawCurrent();
      });
    });

    // console.log(height, width, side, left, top);

    const board = new Array(row);
    for (let i = 0; i < board.length; i++) {
      board[i] = new Array(col).fill(0);
    }

    const resetCurrent = () => {
      const tetromino = randomTetromino();
      current.position = { x: 4, y: 0 };
      current.shape = tintShape(tetromino.shape, tetromino.type);
    };

    const tintShape = (shape: number[][], type: TetrominoType) => {
      return shape.map((row) => row.map((v) => (v === 1 ? type : 0)));
    };

    const current = {
      position: { x: 4, y: 0 },
      shape: [[]] as (number | TetrominoType)[][],
    };
    resetCurrent();
    const checkCollision = () => {
      for (let y = 0; y < current.shape.length; y++) {
        for (let x = 0; x < current.shape[y].length; x++) {
          if (
            current.shape[y][x] &&
            board[y + current.position.y] &&
            board[y + current.position.y][x + current.position.x]
          ) {
            return true;
          }
          if (current.shape[y][x] && y + current.position.y === row) {
            return true;
          }
        }
      }
      return false;
    };
    const checkOutsideWalls = () => {
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
    };

    const merge = () => {
      for (let y = 0; y < current.shape.length; y++) {
        for (let x = 0; x < current.shape[y].length; x++) {
          if (current.shape[y][x]) {
            board[y + current.position.y][x + current.position.x] =
              current.shape[y][x];
          }
        }
      }
    };

    const resetBoard = () => {
      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
          board[i][j] = 0;
        }
      }
    };

    const checkEnd = () => {
      if (board[0].find((v: number) => v)) {
        return true;
      }
      return false;
    };

    const clearRows = () => {
      let i = board.length - 1;
      while (i > 0) {
        if (board[i].every((v: number) => v)) {
          board.splice(i, 1);
          board.unshift(new Array(col).fill(0));
        } else {
          i--;
        }
      }
    };

    const moveLeft = () => {
      current.position.x -= 1;
      const failed = checkOutsideWalls() || checkCollision();
      if (failed) {
        current.position.x += 1;
      }
      return !failed;
    };
    const moveRight = () => {
      current.position.x += 1;
      const failed = checkOutsideWalls() || checkCollision();
      if (failed) {
        current.position.x -= 1;
      }
      return !failed;
    };
    const moveDown = () => {
      current.position.y += 1;
      const isCollision = checkCollision();
      if (isCollision) {
        current.position.y -= 1;
        merge();
        clearRows();
        checkEnd();
        drawBoard();
        resetCurrent();
      }
      return isCollision;
    };

    const snapDown = () => {
      while (!moveDown()) {
        // do nothing
      }
    };

    const rotateCurrent = () => {
      current.shape = rotate(current.shape);
      if (checkOutsideWalls() || checkCollision()) {
        if (moveLeft()) {
          // do nothing
        } else if (moveRight()) {
          // do nothing
        } else {
          current.shape = unrotate(current.shape);
        }
      }
    };

    // arrow up to rotate current shape
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "ArrowLeft":
          moveLeft();
          drawCurrent();
          break;
        case "ArrowRight":
          moveRight();
          drawCurrent();
          break;
        case "ArrowUp":
          rotateCurrent();
          drawCurrent();
          break;
        case "ArrowDown":
          moveDown();
          drawCurrent();
          break;
        case "Space":
          snapDown();
          drawCurrent();
          break;
      }
    });

    let isPointerDown = false;
    let isMoved = false;
    let pointerPosition = { x: 0, y: 0 };
    document.addEventListener("pointerdown", (e) => {
      isPointerDown = true;
      isMoved = false;
      pointerPosition = { x: e.clientX, y: e.clientY };
    });
    document.addEventListener("pointerup", () => {
      isPointerDown = false;
      if (!isMoved) {
        rotateCurrent();
        drawCurrent();
      }
    });
    document.addEventListener("pointercancel", () => {
      isPointerDown = false;
    });

    document.addEventListener("pointermove", (e) => {
      if (isPointerDown) {
        const dx = e.clientX - pointerPosition.x;
        const dy = e.clientY - pointerPosition.y;
        if (dx > side) {
          moveRight();
          drawCurrent();
          pointerPosition = { x: e.clientX, y: e.clientY };
          isMoved = true;
        } else if (dx < -side) {
          moveLeft();
          drawCurrent();
          pointerPosition = { x: e.clientX, y: e.clientY };
          isMoved = true;
        } else if (dy > side) {
          moveDown();
          drawCurrent();
          pointerPosition = { x: e.clientX, y: e.clientY };
          isMoved = true;
        }
      }
    });

    const currentGraphics = new PIXI.Graphics();
    pixiApp.stage.addChild(currentGraphics);

    const drawCurrent = () => {
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
    };

    const boardGraphis = new PIXI.Graphics();

    const palette: Record<TetrominoType, number> = {
      I: 0xcba6f7,
      O: 0xf38ba8,
      T: 0xfab387,
      S: 0xa6e3a1,
      Z: 0x94e2d5,
      J: 0x89b4fa,
      L: 0xf5c2e7,
    };
    const renderBlock = (
      graphis: PIXI.Graphics,
      value: TetrominoType,
      y: number,
      x: number,
    ) => {
      graphis.beginFill(palette[value]);
      graphis.lineStyle(2, 0x7f849c);
      graphis.drawRect(left + x * side, top + y * side, side, side);
    };
    const drawBoard = () => {
      boardGraphis.clear();

      for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
          if (board[i][j]) {
            renderBlock(boardGraphis, board[i][j], i, j);
          }
        }
      }
    };

    pixiApp.stage.addChild(boardGraphis);
    let time = 0;
    pixiApp.ticker.add((deltaTime) => {
      time += deltaTime;
      if (time > 60) {
        time = 0;
        moveDown();
        if (checkEnd()) {
          resetBoard();
        }
        drawCurrent();
        drawBoard();
      }
    });

    if (main.current) {
      main.current.appendChild(pixiApp.view);
    }
    return () => {
      pixiApp.view.remove();
    };
  }, []);

  return (
    <>
      <main ref={main} />
    </>
  );
}

export default App;
