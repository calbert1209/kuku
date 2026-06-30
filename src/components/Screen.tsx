export const Screen = ({
  children,
  extraClass = "",
  flashClass,
  holdProgress,
  isBSide,
}: {
  children: any;
  extraClass?: string;
  flashClass: string;
  holdProgress: number | null;
  isBSide: boolean;
}) => (
  <div className={`screen ${extraClass} ${flashClass}`}>
    {holdProgress !== null && (
      <div className="hold-overlay">
        <div className="display-text" style={{ fontSize: "1.2rem" }}>
          {isBSide ? "せいじょうモードへ" : "たしざんモードへ"}
        </div>
        <div
          className="display-text"
          style={{ fontSize: "2.5rem", marginTop: "10px" }}
        >
          {Math.max(1, Math.ceil(3 - (holdProgress / 100) * 3))}
        </div>
        <div className="hold-bar-container">
          <div className="hold-bar" style={{ width: `${holdProgress}%` }}></div>
        </div>
      </div>
    )}
    {children}
  </div>
);