import { useEffect, useRef, useState } from "react";
import { useWindowSize } from "./hooks/utils/useWindowSize";
import { createGame } from "./Game";
import { useScore } from "./hooks/app/useScore";
import { Icon } from "@iconify/react";
import { playMainThemeMusic } from "./sound";
import { useSafeArea } from "./hooks/utils/useSafeArea";
import { useKeyboardControl } from "./control/keyboard";
import { useTouchControl } from "./control/touch";
import { useLocalStorage } from "./hooks/utils/useLocalStorage";
import { useSoundEffect } from "./hooks/app/useSound";

function App() {
  const main = useRef<HTMLElement>(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const { safeArea } = useSafeArea();
  const [game, setGame] = useState<ReturnType<typeof createGame>>();
  const { score, lines, addScore, resetScore } = useScore();
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [side, setSide] = useState(0);
  const [init, setInit] = useState(false);

  const KEY_BEST_SCORE = "best_score";

  const [bestScore, setBestScore] = useLocalStorage<number>(KEY_BEST_SCORE, 0);

  useEffect(() => {
    const game = createGame();

    game.on("resize", ({ left, top, side }) => {
      console.log("rere", left);
      setLeft(left);
      setTop(top - 2 * side + side * 0.35 + safeArea.top);
      setSide(side);
    });

    setGame(game);

    if (main.current) {
      main.current.appendChild(game.pixiApp.view);
    }
    return () => {
      game.destory();
    };
  }, [safeArea]);

  useEffect(() => {
    if (game?.pixiApp?.renderer) {
      game.pixiApp.renderer.resize(
        windowWidth,
        windowHeight - safeArea.top - safeArea.bottom,
      );
    }
  }, [game, windowWidth, windowHeight, safeArea]);

  useEffect(() => {
    if (game) {
      game.on("gameOver", () => {
        if (score > bestScore) {
          setBestScore(score);
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

  useSoundEffect(game);

  useKeyboardControl(game);

  useTouchControl(game, side);

  const [isPaused, setIsPaused] = useState(true);

  const dialog = useRef<HTMLDialogElement>(null);

  const menu = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (game) {
      setTimeout(() => {
        showModal();
      }, 100);
    }
  }, [game]);

  const showModal = () => {
    setIsPaused(true);

    dialog.current?.showModal();
    game?.pause();
  };

  const closeModal = (e: DocumentEventMap["pointerup"]) => {
    if (dialog.current && e.target === dialog.current) {
      dialog.current.close();
    }
    if (!init) {
      setInit(true);
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
        if (!init) return;
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
  }, [game, isPaused, init]);

  const [isBGMPlaying, setIsBGMPlaying] = useState(false);

  useEffect(() => {
    if (!isPaused && !isBGMPlaying) {
      playMainThemeMusic().then(() => {
        setIsBGMPlaying(false);
      });
      setIsBGMPlaying(true);
    }
  }, [isPaused, isBGMPlaying]);

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
      <main
        ref={main}
        className="select-none"
        style={{ marginTop: `${safeArea.top}px` }}
      />
      <dialog
        className="px-10 py-5 rounded-xl outline-none backdrop:bg-black backdrop:bg-opacity-20 select-none"
        ref={dialog}
      >
        <div className="text-xl">BEST SCORE</div>
        <div className="text-center font-bold text-2xl text-yellow-500">
          {bestScore}
        </div>
      </dialog>
    </>
  );
}

export default App;
