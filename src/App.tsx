import { useEffect, useRef, useState } from "react";
// import './App.css'
import * as PIXI from "pixi.js";
import { useWindowSize } from "./hooks/useWindowSize";
import { createGame } from "./Game";

function App() {
  const main = useRef<HTMLElement>(null);
  const { width, height } = useWindowSize();
  const [pixiApp, setPixiApp] = useState<PIXI.Application<HTMLCanvasElement>>();
  useEffect(() => {
    console.log("pixi effect", pixiApp);

    if (!pixiApp) {
      const {
        pixiApp,
        side,
        moveLeft,
        moveRight,
        moveDown,
        snapDown,
        drawCurrent,
        rotateCurrent,
      } = createGame();
      setPixiApp(pixiApp);

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
      return;
    }

    if (pixiApp.view && main.current) {
      main.current.appendChild(pixiApp.view);
    }
    return () => {
      console.log("destroy");
      if (pixiApp) {
        pixiApp.destroy(true);
      }
      setPixiApp(undefined);
    };
  }, [pixiApp]);

  useEffect(() => {
    if (pixiApp) {
      pixiApp.renderer.resize(width, height);
    }
  }, [pixiApp, width, height]);

  return (
    <>
      <main ref={main} />
    </>
  );
}

export default App;
