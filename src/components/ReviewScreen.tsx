import { type Problem } from "../logic/kuku";
import { Screen } from "./Screen";

interface ReviewProblem extends Problem {
  consecutiveCorrect: number;
}

export const ReviewScreen = ({
  flashClass,
  holdProgress,
  currentInput,
  currentProblem,
  isBSide,
  reviewQueue,
  setGameState,
}: {
  flashClass: string;
  holdProgress: number | null;
  currentInput: string;
  currentProblem: Problem | null;
  isBSide: boolean;
  reviewQueue: Problem[];
  setGameState: (
    state: "SELECT_MODE" | "PLAYING" | "RESULT" | "REVIEW",
  ) => void;
}) => (
  <Screen flashClass={flashClass} holdProgress={holdProgress} isBSide={isBSide}>
    <div
      className="display-text"
      style={{ fontSize: "1.2rem", color: "var(--lcd-text)" }}
    >
      にがてリトライ ({reviewQueue.length}のこり)
    </div>

    <div className="progress-container">
      <div
        className="progress-bar"
        style={{
          width: `${(currentProblem as ReviewProblem).consecutiveCorrect * 50}%`,
        }}
      ></div>
    </div>

    <div className="math-problem display-text">{currentProblem?.q}</div>

    <div className="answer-preview display-text">{currentInput}</div>

    <button
      className="display-text"
      style={{
        fontSize: "0.8rem",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
      onClick={() => setGameState("RESULT")}
    >
      [ ふくしゅうを おわる ]
    </button>
  </Screen>
);
