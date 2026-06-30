import { Screen } from "./Screen";

export const SelectModeScreen = ({isBSide, flashClass, holdProgress, playMode, startGame, setPlayMode}: {
    isBSide: boolean;
    flashClass: string;
    holdProgress: number | null;
    playMode: "SEQUENTIAL" | "REVERSE" | "SHUFFLE";
    startGame: (dan?: number) => void;
    setPlayMode: (mode: "SEQUENTIAL" | "REVERSE" | "SHUFFLE") => void;
  }) => {
    if (isBSide) {
      return (
        <Screen flashClass={flashClass} holdProgress={holdProgress} isBSide={isBSide}>
          <div
            className="display-text"
            style={{ fontSize: "1.4rem", letterSpacing: "2px" }}
          >
            たしざん B-SIDE
          </div>
          <div
            className="display-text"
            style={{
              fontSize: "0.9rem",
              color: "var(--lcd-text)",
              opacity: 0.8,
            }}
          >
            (5 〜 10) バラバラ
          </div>
          <button
            className="lcd-button"
            onClick={() => startGame()}
            style={{ width: "80%", padding: "15px", fontSize: "1.5rem" }}
          >
            スタート
          </button>
        </Screen>
      );
    }

    return (
      <Screen
        flashClass={flashClass}
        holdProgress={holdProgress}
        isBSide={isBSide}
      >
        <div className="mode-toggle">
          <button
            className={`lcd-button lcd-button-small ${playMode === "SEQUENTIAL" ? "" : "display-text"}`}
            style={{
              backgroundColor:
                playMode === "SEQUENTIAL" ? "var(--lcd-text)" : "transparent",
              color:
                playMode === "SEQUENTIAL" ? "var(--lcd-bg)" : "var(--lcd-text)",
            }}
            onClick={() => setPlayMode("SEQUENTIAL")}
          >
            じゅんばん
          </button>
          <button
            className={`lcd-button lcd-button-small ${playMode === "REVERSE" ? "" : "display-text"}`}
            style={{
              backgroundColor:
                playMode === "REVERSE" ? "var(--lcd-text)" : "transparent",
              color:
                playMode === "REVERSE" ? "var(--lcd-bg)" : "var(--lcd-text)",
            }}
            onClick={() => setPlayMode("REVERSE")}
          >
            ぎゃく
          </button>
          <button
            className={`lcd-button lcd-button-small ${playMode === "SHUFFLE" ? "" : "display-text"}`}
            style={{
              backgroundColor:
                playMode === "SHUFFLE" ? "var(--lcd-text)" : "transparent",
              color:
                playMode === "SHUFFLE" ? "var(--lcd-bg)" : "var(--lcd-text)",
            }}
            onClick={() => setPlayMode("SHUFFLE")}
          >
            バラバラ
          </button>
        </div>

        <div className="dan-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dan) => (
            <button
              key={dan}
              className="lcd-button lcd-button-small"
              onClick={() => startGame(dan)}
            >
              {dan}だん
            </button>
          ))}
        </div>

        <button
          className="lcd-button lcd-button-small"
          onClick={() => startGame()}
          style={{ width: "90%" }}
        >
          ぜんぶまぜる
        </button>
      </Screen>
    );
  };