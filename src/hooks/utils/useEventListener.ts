import { useEffect } from "react";

export function useEventListener<
  T extends Document | null,
  K extends keyof DocumentEventMap,
>(target: T, name: K, handler: (ev: DocumentEventMap[K]) => void): void;

export function useEventListener<
  T extends HTMLElement | null,
  K extends keyof HTMLElementEventMap,
>(target: T, name: K, handler: (ev: HTMLElementEventMap[K]) => void): void;

export function useEventListener<
  T extends Window | null,
  K extends keyof WindowEventMap,
>(target: T, name: K, handler: (ev: WindowEventMap[K]) => void): void;

export function useEventListener(
  target: Document | HTMLElement | Window,
  name: string,
  handler: (ev: Event) => void,
): void {
  useEffect(() => {
    if (!target) return;
    target.addEventListener(name, handler);
    return () => {
      target.removeEventListener(name, handler);
    };
  }, [target, name, handler]);
}
