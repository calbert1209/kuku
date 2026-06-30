import { type Problem } from "../logic/kuku";
import { Screen } from "./Screen";

export const ResultScreen = ({
  flashClass,
  holdProgress,
  currentScore,
  mistakes,
  startReview,
  setGameState,
  isBSide,
}: {
  flashClass: string;
  holdProgress: number | null;
  currentScore: number;
  mistakes: Problem[];
  startReview: () => void;
  setGameState: (
    state: "SELECT_MODE" | "PLAYING" | "RESULT" | "REVIEW",
  ) => void;
  isBSide: boolean;
}) => (
  <Screen flashClass={flashClass} holdProgress={holdProgress} isBSide={isBSide}>
    <div className="display-text" style={{ fontSize: "2rem" }}>
      おわり！
    </div>
    <div
      className="display-text"
      style={{ fontSize: "1.2rem", textAlign: "center" }}
    >
      せいかい: {currentScore}
      <br />
      まちがい: {mistakes.length}
    </div>
    <div
      style={{
        width: "80%",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <button
        className="lcd-button"
        onClick={() => setGameState("SELECT_MODE")}
      >
        もういっかい
      </button>
      {mistakes.length > 0 && (
        <button
          className="lcd-button"
          onClick={startReview}
          style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
        >
          ふくしゅう ({new Set(mistakes.map((p) => p.id)).size})
        </button>
      )}
    </div>
  </Screen>
);