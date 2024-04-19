import { useState, useLayoutEffect, useEffect } from "react";

const getRootCSSVar = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};

export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useLayoutEffect(() => {
    const id = "sat-sar-sab-sal";
    if (!document.getElementById(id)) {
      const rootStyle = document.createElement("style");

      rootStyle.id = id;
      rootStyle.innerHTML = `
        :root {
          --sat: env(safe-area-inset-top);
          --sar: env(safe-area-inset-right);
          --sab: env(safe-area-inset-bottom);
          --sal: env(safe-area-inset-left);
        }
      `;

      document.head.appendChild(rootStyle);
      return () => {
        document.head.removeChild(rootStyle);
      };
    }
  }, []);

  useEffect(() => {
    setSafeArea({
      top: parseFloat(getRootCSSVar("--sat")),
      right: parseFloat(getRootCSSVar("--sar")),
      bottom: parseFloat(getRootCSSVar("--sab")),
      left: parseFloat(getRootCSSVar("--sal")),
    });
  }, []);
  return { safeArea };
};
