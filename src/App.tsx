import { useEffect, useRef, useState } from "react";
// import './App.css'
import { useWindowSize } from "./hooks/useWindowSize";
import { createGame } from "./Game";
import { useScore } from "./hooks/useScore";

function App() {
  const main = useRef<HTMLElement>(null);
  const { width, height } = useWindowSize();
  const [game, setGame] = useState<ReturnType<typeof createGame>>();
  const { score, lines, addScore, resetScore } = useScore();
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [fontSize, setFontSize] = useState(0);

  useEffect(() => {
    const game = createGame();

    game.on("resize", ({ left, top, side }) => {
      console.log("rere", left);
      setLeft(left);
      setTop(top - 2 * side + side * 0.35);
      setFontSize(side * 0.5);
    });

    setGame(game);

    if (main.current) {
      main.current.appendChild(game.pixiApp.view);
    }
    return () => {
      game.destory();
    };
  }, []);

  useEffect(() => {
    if (game?.pixiApp) {
      game.pixiApp.renderer.resize(width, height);
    }
  }, [game, width, height]);

  useEffect(() => {
    if (game) {
      game.on("clearRows", (rows) => {
        addScore(rows);
      });
      game.on("gameOver", () => {
        resetScore();
      });
    }
  }, [game]);

  useEffect(() => {
    if (game) {
      const {
        side,
        moveLeft,
        moveRight,
        moveDown,
        rotateCurrent,
        drawCurrent,
        snapDown,
      } = game;

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
    }
  }, [game]);

  return (
    <>
      <div
        className="absolute leading-tight"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          fontSize: `${fontSize}px`,
        }}
      >
        <p>SCORE: {score}</p>
        <p>LINES: {lines}</p>
      </div>
      <main ref={main} />
    </>
  );
}

export default App;
