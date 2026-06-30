import { useState, useEffect, useRef } from "preact/hooks";
import {
  type Problem,
  generateKuku,
  shuffleProblems,
  getDanProblems,
  reverseProblems,
  generateAddition,
} from "./kuku";
import { useAudioContext } from "./useAudioContext";

type GameState = "SELECT_MODE" | "PLAYING" | "RESULT" | "REVIEW";
type PlayMode = "SHUFFLE" | "SEQUENTIAL" | "REVERSE";

interface ReviewProblem extends Problem {
  consecutiveCorrect: number;
}

const GAME_DURATION = 60;

export const useApp = () => {
  const timerRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>("SELECT_MODE");
  const [playMode, setPlayMode] = useState<PlayMode>("SHUFFLE");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [mistakes, setMistakes] = useState<Problem[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewProblem[]>([]);
  const [flashClass, setFlashClass] = useState("");

  // B-Side Hidden Mode States
  const [isBSide, setIsBSide] = useState(false);
  const [holdProgress, setHoldProgress] = useState<number | null>(null);

  const currentProblem =
    gameState === "REVIEW" ? reviewQueue[currentIndex] : problems[currentIndex];

  const { playToggleSound, playHoldSound, playSound } = useAudioContext();

  useEffect(() => {
    if (gameState === "PLAYING" && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  // Keyboard long-press and event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Escape") {
        if (!e.repeat) {
          startHold();
        }
        e.preventDefault();
      } else if (gameState === "PLAYING" || gameState === "REVIEW") {
        if (e.key >= "0" && e.key <= "9") {
          handleInput(e.key);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Escape") {
        cancelHold();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, currentInput, currentProblem, isBSide]);

  const toggleBSide = () => {
    setIsBSide((prev) => {
      const next = !prev;
      playToggleSound(next);
      setGameState("SELECT_MODE");
      setProblems([]);
      setCurrentIndex(0);
      setCurrentInput("");
      setScore({ correct: 0, wrong: 0 });
      setMistakes([]);
      setReviewQueue([]);
      return next;
    });
  };

  const startHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
    let progress = 0;

    playHoldSound(0);

    holdIntervalRef.current = window.setInterval(() => {
      progress += 3.33; // 100ms * 30 ticks = 3000ms
      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        setHoldProgress(null);
        toggleBSide();
      } else {
        setHoldProgress(Math.min(100, progress));
        playHoldSound(progress);
      }
    }, 100);
  };

  const handleClear = () => {
    setCurrentInput("");
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
      setHoldProgress(null);
      handleClear();
    }
  };

  const startReview = () => {
    const uniqueMistakes = Array.from(new Set(mistakes.map((p) => p.id)))
      .map((id) => mistakes.find((p) => p.id === id)!)
      .map((p) => ({ ...p, consecutiveCorrect: 0 }));

    setReviewQueue(uniqueMistakes);
    setCurrentIndex(0);
    setCurrentInput("");
    setGameState("REVIEW");
  };

  const startGame = (dan?: number) => {
    let baseProblems = isBSide
      ? generateAddition()
      : dan
        ? getDanProblems(dan)
        : generateKuku();
    if (isBSide || playMode === "SHUFFLE") {
      baseProblems = shuffleProblems(baseProblems);
    } else if (playMode === "REVERSE") {
      baseProblems = reverseProblems(baseProblems);
    }

    setProblems(baseProblems);
    setCurrentIndex(0);
    setCurrentInput("");
    setTimeLeft(GAME_DURATION);
    setScore({ correct: 0, wrong: 0 });
    setMistakes([]);
    setGameState("PLAYING");
  };

  const endGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState("RESULT");
  };

  const checkAnswer = (input: string) => {
    if (!currentProblem) return;

    const isCorrect = parseInt(input) === currentProblem.a;

    if (gameState === "PLAYING") {
      if (isCorrect) {
        playSound("correct");
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
        setFlashClass("flash-correct");
      } else {
        playSound("wrong");
        setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
        setMistakes((prev) => [...prev, currentProblem]);
        setFlashClass("flash-wrong");
      }

      setTimeout(() => {
        setFlashClass("");
        setCurrentInput("");
        if (currentIndex < problems.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          endGame();
        }
      }, 200);
    } else if (gameState === "REVIEW") {
      if (isCorrect) {
        playSound("correct");
        setFlashClass("flash-correct");
        const updatedQueue = [...reviewQueue];
        updatedQueue[currentIndex].consecutiveCorrect += 1;

        setTimeout(() => {
          setFlashClass("");
          setCurrentInput("");
          if (updatedQueue[currentIndex].consecutiveCorrect >= 2) {
            const newQueue = updatedQueue.filter((_, i) => i !== currentIndex);
            setReviewQueue(newQueue);
            if (newQueue.length === 0) {
              setGameState("RESULT");
            } else if (currentIndex >= newQueue.length) {
              setCurrentIndex(0);
            }
          } else {
            setCurrentIndex((prev) => (prev + 1) % updatedQueue.length);
            setReviewQueue(updatedQueue);
          }
        }, 200);
      } else {
        playSound("wrong");
        setFlashClass("flash-wrong");
        const updatedQueue = [...reviewQueue];
        updatedQueue[currentIndex].consecutiveCorrect = 0;
        setReviewQueue(updatedQueue);

        setTimeout(() => {
          setFlashClass("");
          setCurrentInput("");
          setCurrentIndex((prev) => (prev + 1) % updatedQueue.length);
        }, 200);
      }
    }
  };

  const handleInput = (num: string) => {
    if ((gameState !== "PLAYING" && gameState !== "REVIEW") || !currentProblem)
      return;

    playSound("click");
    const nextInput = currentInput + num;
    const targetLength = currentProblem.a.toString().length;

    if (nextInput.length <= targetLength) {
      setCurrentInput(nextInput);

      if (nextInput.length === targetLength) {
        checkAnswer(nextInput);
      }
    }
  };

  return {
    gameState,
    setGameState,
    playMode,
    setPlayMode,
    problems,
    currentIndex,
    currentInput,
    timeLeft,
    score,
    mistakes,
    reviewQueue,
    flashClass,
    isBSide,
    holdProgress,
    setHoldProgress,
    startHold,
    holdIntervalRef,
    cancelHold,
    startReview,
    startGame,
    handleInput,
    currentProblem,
  };
};