import { useEffect } from "react";
import type { Game } from "../game";

export const useTouchControl = (game: Game | undefined, side: number) => {
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
};
