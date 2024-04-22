import { useEffect } from "react";
import { Game } from "../../game";
import {
  playClearSound,
  playGameOverSound,
  playMoveSound,
  playSnapSound,
} from "../../sound";

export const useSoundEffect = (game: Game | undefined) => {
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
};
