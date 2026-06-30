import "./index.css";
import { useApp } from "./logic/useApp";
import { ReviewScreen } from "./components/ReviewScreen";
import { PlayingScreen } from "./components/PlayingScreen";
import { ResultScreen } from "./components/ResultScreen";
import { SelectModeScreen } from "./components/SelectModeScreen";

export function App() {
  const {
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
    currentProblem,
    startHold,
    cancelHold,
    startReview,
    startGame,
    handleInput,
  } = useApp();

  const isInputActive = gameState === "PLAYING" || gameState === "REVIEW";

  return (
    <div className={`device-container ${isBSide ? "b-side" : ""}`}>
      {gameState === "SELECT_MODE" ? (
        <SelectModeScreen
          flashClass={flashClass}
          holdProgress={holdProgress}
          isBSide={isBSide}
          startGame={startGame}
          playMode={playMode}
          setPlayMode={setPlayMode}
        />
      ) : null}
      {gameState === "PLAYING" ? (
        <PlayingScreen
          flashClass={flashClass}
          holdProgress={holdProgress}
          currentInput={currentInput}
          currentIndex={currentIndex}
          problems={problems}
          timeLeft={timeLeft}
          currentProblem={currentProblem}
          currentScore={score.correct}
          isBSide={isBSide}
        />
      ) : null}
      {gameState === "RESULT" ? (
        <ResultScreen
          flashClass={flashClass}
          holdProgress={holdProgress}
          currentScore={score.correct}
          mistakes={mistakes}
          startReview={startReview}
          setGameState={setGameState}
          isBSide={isBSide}
        />
      ) : null}
      {gameState === "REVIEW" ? (
        <ReviewScreen
          flashClass={flashClass}
          holdProgress={holdProgress}
          currentInput={currentInput}
          currentProblem={currentProblem}
          isBSide={isBSide}
          reviewQueue={reviewQueue}
          setGameState={setGameState}
        />
      ) : null}

      <div className="numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            className="key"
            onClick={() => handleInput(num.toString())}
            disabled={!isInputActive}
          >
            {num}
          </button>
        ))}
        <button
          className="key key-clear"
          onPointerDown={(e) => {
            e.preventDefault();
            startHold();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            cancelHold();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            cancelHold();
          }}
        >
          C
        </button>
        <button
          className="key"
          onClick={() => handleInput("0")}
          disabled={!isInputActive}
        >
          0
        </button>
        <button className="key" style={{ visibility: "hidden" }}></button>
      </div>
    </div>
  );
}
