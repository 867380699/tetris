import { useEffect, useRef, useState } from "react";
// import './App.css'
import { useWindowSize } from "./hooks/useWindowSize";
import { createGame } from "./Game";
import { useScore } from "./hooks/useScore";
import { Icon } from "@iconify/react";
import {
  playClearSound,
  playGameOverSound,
  playMoveSound,
  playSnapSound,
} from "./sound";

function App() {
  const main = useRef<HTMLElement>(null);
  const { width, height } = useWindowSize();
  const [game, setGame] = useState<ReturnType<typeof createGame>>();
  const { score, lines, addScore, resetScore } = useScore();
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [side, setSide] = useState(0);
  const [bestScore, setBestScore] = useState(0);

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

  const KEY_BEST_SCORE = "best_score";

  useEffect(() => {
    try {
      const storageScore = localStorage.getItem(KEY_BEST_SCORE);
      const score = Number.parseInt(storageScore || "") || 0;
      setBestScore(score);
    } catch (e) {
      //
    }
  }, []);

  useEffect(() => {
    if (game) {
      game.on("gameOver", () => {
        try {
          if (score > bestScore) {
            setBestScore(score);
            localStorage.setItem(KEY_BEST_SCORE, `${score}`);
          }
        } catch (e) {
          //
        }
      });
    }
  }, [game, score, bestScore]);

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
      game.on("clearRows", () => {
        playClearSound();
      });
      game.on("gameOver", () => {
        playGameOverSound();
      });
      game.on("moveLeft", () => {
        playMoveSound();
      });
      game.on("moveRight", () => {
        playMoveSound();
      });
      game.on("moveDown", () => {
        playMoveSound();
      });
      game.on("rotate", () => {
        playMoveSound();
      });
      game.on("snapDown", () => {
        playSnapSound();
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

      const onPointerDown = (e: DocumentEventMap["pointerdown"]) => {
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

      const onPointerUp = () => {
        isPointerDown = false;
        if (!isMoved) {
          rotateCurrent();
          drawCurrent();
        } else {
          swipeDown();
        }
      };

      const onTouchEnd = () => {
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

      const onPointerMove = (e: DocumentEventMap["pointermove"]) => {
        if (isPointerDown) {
          const { clientX, clientY } = e;
          onMove(clientX, clientY);
        }
      };
      const onTouchMove = (e: DocumentEventMap["touchmove"]) => {
        const { clientX, clientY } = e.touches[0];
        onMove(clientX, clientY);
      };

      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointermove", onPointerMove);

      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onTouchEnd);

      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };
    }
  }, [game, side]);

  const [isPaused, setIsPaused] = useState(false);

  const dialog = useRef<HTMLDialogElement>(null);

  const menu = useRef<SVGSVGElement>(null);

  const showModal = () => {
    setIsPaused(true);

    dialog.current?.showModal();
    game?.pause();
  };

  const closeModal = (e: DocumentEventMap["pointerup"]) => {
    if (dialog.current && e.target === dialog.current) {
      dialog.current.close();
    }
  };

  const onModalClose = () => {
    setIsPaused(false);
    game?.resume();
  };

  useEffect(() => {
    const menuRef = menu.current;
    const dialogRef = dialog.current;

    if (menuRef) {
      menuRef.addEventListener("pointerup", showModal);
    }
    if (dialogRef) {
      dialogRef.addEventListener("pointerup", closeModal);
      dialogRef.addEventListener("close", onModalClose);
    }

    return () => {
      if (menuRef) {
        menuRef.removeEventListener("pointerup", showModal);
      }
      if (dialogRef) {
        dialogRef.removeEventListener("pointerup", closeModal);
        dialogRef.removeEventListener("close", onModalClose);
      }
    };
  }, [game]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault(); // Esc will close modal by default
        if (isPaused) {
          dialog.current?.close();
          game?.resume();
          setIsPaused(false);
        } else {
          dialog.current?.showModal();
          game?.pause();
          setIsPaused(true);
        }
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("keydown", onEsc);
    };
  }, [game, isPaused]);

  return (
    <>
      <Icon
        icon={
          isPaused
            ? "material-symbols:play-arrow-rounded"
            : "material-symbols:pause"
        }
        className="absolute font-bold"
        style={{
          top: `${top + 4}px`,
          fontSize: `${side}px`,
          left: `${left}px`,
        }}
        ref={menu}
      />
      <div
        className="absolute leading-tight select-none text-white"
        style={{
          left: `${left + side + 4}px`,
          top: `${top}px`,
          fontSize: `${side * 0.5}px`,
        }}
      >
        <p>SCORE: {score}</p>
        <p>LINES: {lines}</p>
      </div>
      <main ref={main} className="select-none" />
      <dialog
        className="px-10 py-5 rounded-xl outline-none backdrop:bg-black backdrop:bg-opacity-20 select-none"
        ref={dialog}
      >
        <div>Best Score</div>
        <div className="text-center font-bold text-lg text-yellow-500">
          {bestScore}
        </div>
      </dialog>
    </>
  );
}

export default App;
