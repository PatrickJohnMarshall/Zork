function PlayerStatsReadout({ playerStats }) {
  const mobileCheck = window.innerWidth > 700;

  return (
    <div
      className="rpgui-container framed readout-box"
      style={{
        gridColumn: 3,
        overflowWrap: "anywhere",
      }}
    >
      <div className="stat-grid">
        Stats:
        <div>
          {mobileCheck ? `Strength:` : "Str:"} {playerStats.getAttributes().str}
        </div>
        <div>
          {mobileCheck ? `Dexterity:` : "Dex:"}{" "}
          {playerStats.getAttributes().dex}
        </div>
        <div>
          {mobileCheck ? `Constitution:` : "Con:"}{" "}
          {playerStats.getAttributes().con}
        </div>
        <div>
          {mobileCheck ? `Intelligence:` : "Int:"}{" "}
          {playerStats.getAttributes().int}
        </div>
        <div>
          {mobileCheck ? `Wisdom:` : "Wis:"} {playerStats.getAttributes().wis}
        </div>
        <div>
          {mobileCheck ? `Charisma:` : "Cha:"} {playerStats.getAttributes().cha}
        </div>
        <div>HP: {playerStats.getHP()}</div>
        <div>AC: {playerStats.getAC()}</div>
      </div>
    </div>
  );
}

export default PlayerStatsReadout;
