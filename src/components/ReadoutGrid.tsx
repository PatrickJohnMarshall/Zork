import React from "react";
import "styles/_readout_grid.scss";
import Inventory from "./Inventory";
import SpellRepertoire from "./SpellRepertoire";
import InfoBlocks from "./InfoBlocks";

function ReadoutGrid({ monsters, weapons }) {
  return (
    <div className="rpgui-container framed-golden" style={{ height: "513px" }}>
      <div className="readout-grid">
        <Inventory weapons={weapons} />
        <SpellRepertoire />
        <InfoBlocks monsters={monsters} />
      </div>
    </div>
  );
}

export default ReadoutGrid;