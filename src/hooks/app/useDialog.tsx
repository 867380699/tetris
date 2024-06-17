import { useCallback, useEffect, useRef, useState } from "react";

export const useDialog = (initOpen: boolean = false) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(initOpen);

  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };

  const Dialog = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <div
        className="modal fixed bg-black/20 top-0 bottom-0 left-0 right-0 z-50 p-4"
        ref={dialogRef}
      >
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-black text-center px-10 py-5 rounded-xl outline-none select-none">
          {children}
        </div>
      </div>
    ),
    [],
  );

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.classList.add("block");
      dialogRef.current?.classList.remove("hidden");
    } else {
      dialogRef.current?.classList.add("hidden");
      dialogRef.current?.classList.remove("block");
    }
  }, [isOpen]);

  useEffect(() => {
    const currentDialog = dialogRef.current;

    const closeModal = (e: PointerEvent | TouchEvent) => {
      console.log("pe|te", e);
      if (e.target === currentDialog) {
        currentDialog?.classList.add("hidden");
        currentDialog?.dispatchEvent(new Event("close"));
      }
    };

    if (currentDialog) {
      currentDialog.addEventListener("pointerup", closeModal);
      currentDialog.addEventListener("touchend", closeModal);
      return () => {
        currentDialog.removeEventListener("pointerup", closeModal);
        currentDialog.addEventListener("touchend", closeModal);
      };
    }
  }, []);

  useEffect(() => {
    const currentDialog = dialogRef.current;
    if (currentDialog) {
      currentDialog.addEventListener("close", close);
      return () => {
        currentDialog.removeEventListener("close", close);
      };
    }
  }, []);

  return {
    Dialog,
    isOpen,
    open,
    close,
  };
};
