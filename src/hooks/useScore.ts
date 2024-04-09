import { useState } from "react";

export const useScore = () => {
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);

  const addScore = (n: number) => {
    setScore(
      (score) => score + n * 100 + (n > 1 ? Math.pow(2, n - 2) * 100 : 0),
    );
    setLines((l) => l + n);
  };

  const resetScore = () => {
    console.log("reset score");
    setScore(0);
    setLines(0);
  };

  return { score, lines, addScore, resetScore };
};
