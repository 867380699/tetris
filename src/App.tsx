import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowSize } from "./hooks/utils/useWindowSize";
import { createGame } from "./Game";
import { useScore } from "./hooks/app/useScore";
import { playMainThemeMusic } from "./sound";
import { useSafeArea } from "./hooks/utils/useSafeArea";
import { useKeyboardControl } from "./control/keyboard";
import { useTouchControl } from "./control/touch";
import { useLocalStorage } from "./hooks/utils/useLocalStorage";
import { useSoundEffect } from "./hooks/app/useSound";

import IconPause from "~icons/material-symbols/pause";
import IconPlay from "~icons/material-symbols/play-arrow-rounded";
import { useDialog } from "./hooks/app/useDialog";

import { useEventListener } from "./hooks/utils/useEventListener";

function App() {
  const main = useRef<HTMLElement>(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const { safeArea } = useSafeArea();
  const [game, setGame] = useState<ReturnType<typeof createGame>>();
  const { score, lines, addScore, resetScore } = useScore();
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [side, setSide] = useState(0);

  const KEY_BEST_SCORE = "best_score";

  const [bestScore, setBestScore] = useLocalStorage<number>(KEY_BEST_SCORE, 0);

  useEffect(() => {
    const game = createGame();

    game.on("resize", ({ left, top, side }) => {
      console.log("rere", left);
      setLeft(left);
      setTop(top - 2 * side + safeArea.top);
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

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
  };

  const {
    Dialog: Modal,
    open: openModal,
    close: closeModal,
    isOpen: isModalOpen,
  } = useDialog();

  useEffect(() => {
    if (isPaused) {
      openModal();
    } else {
      closeModal();
    }
  }, [isPaused, openModal, closeModal]);

  useEffect(() => {
    if (isPaused) {
      game?.pause();
    } else {
      game?.resume();
    }
  }, [game, isPaused]);

  useEffect(() => {
    if (!isModalOpen) {
      resume();
    }
  }, [isModalOpen]);

  const menu = useRef<HTMLElement>(null);

  const Icon = isPaused ? IconPlay : IconPause;

  useEffect(() => {
    if (game) {
      setTimeout(() => {
        pause();
      }, 100);
    }
  }, [game]);

  useEventListener(menu.current, "pointerup", pause);

  const onEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault(); // Esc will close modal by default
        if (isPaused) {
          resume();
        } else {
          pause();
        }
      }
    },
    [isPaused],
  );

  useEventListener(document, "keydown", onEsc);

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
      <header
        className="absolute flex items-center gap-1"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${side * 6}px`,
          height: `${side * 2}px`,
        }}
      >
        <span ref={menu}>
          <Icon
            className="font-bold"
            style={{
              fontSize: `${side}px`,
            }}
          />
        </span>

        <div
          className="leading-tight select-none text-white"
          style={{
            fontSize: `${side * 0.5}px`,
          }}
        >
          <p>SCORE: {score}</p>
          <p>LINES: {lines}</p>
        </div>
      </header>

      <main
        ref={main}
        className="select-none"
        style={{ marginTop: `${safeArea.top}px` }}
      />

      <Modal>
        <div className="text-xl">BEST SCORE</div>
        <div className="text-center font-bold text-2xl text-yellow-500">
          {bestScore}
        </div>
      </Modal>
    </>
  );
}

export default App;
