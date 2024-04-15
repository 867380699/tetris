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
  const [side, setSide] = useState(0);

  useEffect(() => {
    const game = createGame();

    game.on("resize", ({ left, top, side }) => {
      console.log("rere", left);
      setLeft(left);
      setTop(top - 2 * side + side * 0.35);
      setSide(side);
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
    if (game?.pixiApp?.renderer) {
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

  const onKeyDown = useRef<(ev: DocumentEventMap["keydown"]) => void>();
  useEffect(() => {
    if (game) {
      const {
        moveLeft,
        moveRight,
        moveDown,
        rotateCurrent,
        drawCurrent,
        snapDown,
      } = game;
      onKeyDown.current = (ev) => {
        switch (ev.code) {
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
      };
      if (onKeyDown.current) {
        document.addEventListener("keydown", onKeyDown.current);
      }
    }
    return () => {
      if (onKeyDown.current) {
        document.removeEventListener("keydown", onKeyDown.current);
      }
    };
  }, [game]);

  const onPointerDown = useRef<(ev: DocumentEventMap["pointerdown"]) => void>();
  const onPointerUp = useRef<(ev: DocumentEventMap["pointerup"]) => void>();
  const onPointerMove = useRef<(ev: DocumentEventMap["pointermove"]) => void>();
  const onTouchMove = useRef<(ev: DocumentEventMap["touchmove"]) => void>();
  const onTouchEnd = useRef<(ev: DocumentEventMap["touchend"]) => void>();

  useEffect(() => {
    if (game) {
      const {
        moveLeft,
        moveRight,
        moveDown,
        rotateCurrent,
        drawCurrent,
        snapDown,
      } = game;

      let isPointerDown = false;
      let isMoved = false;
      let moveStartTime = 0;
      let moveDownCount = 0;
      let pointerPosition = { x: 0, y: 0 };

      onPointerDown.current = (e) => {
        isPointerDown = true;
        moveStartTime = Date.now();
        moveDownCount = 0;
        isMoved = false;
        pointerPosition = { x: e.clientX, y: e.clientY };
      };

      const swipeDown = () => {
        if (moveDownCount > 1 && Date.now() - moveStartTime < 200) {
          snapDown();
          drawCurrent();
          moveDownCount = 0;
        }
      };

      onPointerUp.current = () => {
        isPointerDown = false;
        if (!isMoved) {
          rotateCurrent();
          drawCurrent();
        } else {
          swipeDown();
        }
      };

      onTouchEnd.current = () => {
        swipeDown();
      };

      const onMove = (clientX: number, clientY: number) => {
        const dx = clientX - pointerPosition.x;
        const dy = clientY - pointerPosition.y;
        if (dx > side) {
          moveRight();
          drawCurrent();
          pointerPosition = { x: clientX, y: clientY };
          isMoved = true;
        } else if (dx < -side) {
          moveLeft();
          drawCurrent();
          pointerPosition = { x: clientX, y: clientY };
          isMoved = true;
        } else if (dy > side) {
          moveDown();
          drawCurrent();
          pointerPosition = { x: clientX, y: clientY };
          isMoved = true;
          moveDownCount++;
        } else if (dy < -3 * side) {
          rotateCurrent();
          drawCurrent();
          pointerPosition = { x: clientX, y: clientY };
          isMoved = true;
        }
      };

      onPointerMove.current = (e) => {
        if (isPointerDown) {
          const { clientX, clientY } = e;
          onMove(clientX, clientY);
        }
      };
      onTouchMove.current = (e) => {
        const { clientX, clientY } = e.touches[0];
        onMove(clientX, clientY);
      };

      document.addEventListener("pointerdown", onPointerDown.current);
      document.addEventListener("pointerup", onPointerUp.current);
      document.addEventListener("pointermove", onPointerMove.current);

      document.addEventListener("touchmove", onTouchMove.current);
      document.addEventListener("touchend", onTouchEnd.current);

      return () => {
        if (onPointerDown.current) {
          document.removeEventListener("pointerdown", onPointerDown.current);
        }
        if (onPointerUp.current) {
          document.removeEventListener("pointerup", onPointerUp.current);
        }
        if (onPointerMove.current) {
          document.removeEventListener("pointermove", onPointerMove.current);
        }

        if (onTouchMove.current) {
          document.removeEventListener("touchmove", onTouchMove.current);
        }
        if (onTouchEnd.current) {
          document.removeEventListener("touchend", onTouchEnd.current);
        }
      };
    }
  }, [game, side]);

  return (
    <>
      <div
        className="absolute leading-tight select-none text-white"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          fontSize: `${side * 0.5}px`,
        }}
      >
        <p>SCORE: {score}</p>
        <p>LINES: {lines}</p>
      </div>
      <main ref={main} className="select-none" />
    </>
  );
}

export default App;
