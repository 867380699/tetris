import { useEffect } from "react";
import { Game } from "../Game";

export function useKeyboardControl(game: Game | undefined) {
  useEffect(() => {
    if (!game) return;

    const {
      moveLeft,
      moveRight,
      moveDown,
      rotateCurrent,
      drawCurrent,
      snapDown,
    } = game;

    const onKeyDown = (ev: KeyboardEvent) => {
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
    if (onKeyDown) {
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      if (onKeyDown) {
        document.removeEventListener("keydown", onKeyDown);
      }
    };
  }, [game]);
}
