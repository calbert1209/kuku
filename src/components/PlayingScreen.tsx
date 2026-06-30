import { type Problem } from "../logic/kuku";
import { Screen } from "./Screen";

export const PlayingScreen = ({
  flashClass,
  holdProgress,
  currentInput,
  currentIndex,
  problems,
  timeLeft,
  currentProblem,
  isBSide,
  currentScore,
}: {
  flashClass: string;
  holdProgress: number | null;
  currentInput: string;
  currentIndex: number;
  problems: Problem[];
  timeLeft: number;
  currentProblem: Problem | null;
  currentScore: number;
  isBSide: boolean;
}) => (
  <Screen flashClass={flashClass} holdProgress={holdProgress} isBSide={isBSide}>
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{ width: `${(currentIndex / problems.length) * 100}%` }}
      ></div>
    </div>

    <div className="timer-text display-text">
      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
    </div>

    <div className="math-problem display-text">{currentProblem?.q}</div>

    <div className="answer-preview display-text">{currentInput}</div>

    <div className="display-text" style={{ fontSize: "1rem" }}>
      せいかい: {currentScore}
    </div>
  </Screen>
);