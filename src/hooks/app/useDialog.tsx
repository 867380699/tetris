import { useCallback, useEffect, useRef, useState } from "react";

export const useDialog = (initOpen: boolean = false) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [isOpen, setIsOpen] = useState(initOpen);

  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };

  const Dialog = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <dialog
        className="px-10 py-5 rounded-xl outline-none backdrop:bg-black backdrop:bg-opacity-20 select-none"
        ref={dialogRef}
      >
        {children}
      </dialog>
    ),
    [],
  );

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const currentDialog = dialogRef.current;

    const closeModal = (e: PointerEvent) => {
      if (e.target === currentDialog) {
        currentDialog?.close();
      }
    };

    if (currentDialog) {
      currentDialog.addEventListener("pointerup", closeModal);
      return () => {
        currentDialog.removeEventListener("pointerup", closeModal);
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
