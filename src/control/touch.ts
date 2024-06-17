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

      const onDown = (x:number,y:number) => {
        isPointerDown = true;
        moveStartTime = Date.now();
        moveDownCount = 0;
        isMoved = false;
        pointerPosition = { x, y };
      }

      const swipeDown = () => {
        if (moveDownCount > 1 && Date.now() - moveStartTime < 200) {
          snapDown();
          drawCurrent();
          moveDownCount = 0;
        }
      };

      const onMove = (clientX: number, clientY: number) => {
        const dx = clientX - pointerPosition.x;
        const dy = clientY - pointerPosition.y;
        if (dx > side) {
          pointerPosition = { x: clientX, y: clientY };
          isMoved = true;
          moveRight();
          drawCurrent();
        } else if (dx < -side) {
          pointerPosition = { x: clientX, y: clientY };
          isMoved = true;
          moveLeft();
          drawCurrent();
        } else if (dy > side) {
          pointerPosition = { x: clientX, y: clientY };
          isMoved = true;
          moveDown();
          drawCurrent();
          moveDownCount++;
        } else if (dy < -3 * side) {
          pointerPosition = { x: clientX, y: clientY };
          isMoved = true;
          rotateCurrent();
          drawCurrent();
        }
      };
      
      const onPointerDown = (e: DocumentEventMap["pointerdown"]) => {
        onDown(e.clientX, e.clientY )
      };

      const onPointerMove = (e: DocumentEventMap["pointermove"]) => {
        if (isPointerDown) {
          const { clientX, clientY } = e;
          onMove(clientX, clientY);
        }
      };

      const onPointerUp = () => {
        if (isPointerDown) {
          isPointerDown = false;
          if (!isMoved) {
            rotateCurrent();
            drawCurrent();
          } else {
            swipeDown();
          }
        }
      };

      const onTouchStart = (e: DocumentEventMap["touchstart"]) => {
        const { clientX, clientY } = e.touches[0];
        onDown(clientX,clientY)
      };
      const onTouchMove = (e: DocumentEventMap["touchmove"]) => {
        if (isPointerDown) {
          const { clientX, clientY } = e.touches[0];
          onMove(clientX, clientY);
        }
      };
      const onTouchEnd = () => {
        onPointerUp();
      };

      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);

      document.addEventListener("touchstart", onTouchStart)
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onTouchEnd);

      return () => {
        document.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("touchstart", onTouchStart)
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };
    }
  }, [game, side]);
};
