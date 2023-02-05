import { useState } from "react";
import ReadoutGrid from "../ReadoutGrid";

import "styles/_scrollbars.scss";
import "styles/_hr.scss";
import "styles/_input.scss";

import { TerminalController } from "../TerminalController";
import TerminalLogContext from "../../context/TerminalLog";
import { TerminalOutput } from "../Terminal";

import { GameState } from "state/GameState";

// import buildLayout from "../../tower-layout/buildLayout";
// import generateMonsters from "../../monsters/generateMonsters";

// import FireBolt from "spells/spells/FireBolt";

// import PlayerAction from "../../player/PlayerAction";
// import PlayerLocation from "../../player/PlayerLocation";
// import PlayerInventory from "../../player/PlayerInventory";
// import PlayerStats from "player/PlayerStats";
import HelpMenu from "components/ReadoutGrid/HelpMenu";
// import generateItems from "items/generateItems";
import getRoomItemDescriptions from "util/getRoomItemDescriptions";

// const startingRoom = buildLayout();
// const startingSpell = new FireBolt();
// const items = generateItems();
// const monsters = generateMonsters();

// const playerLocation = new PlayerLocation(startingRoom);
// const playerInventory = new PlayerInventory(items.defaultWeapon);
// playerInventory.learnSpell(startingSpell);

// const playerStats = new PlayerStats({
//   str: 10,
//   dex: 10,
//   con: 10,
//   int: 10,
//   wis: 10,
//   cha: 10,
//   mana: 10,
//   hp: 10,
//   ac: 10,
// });

// const playerAction = new PlayerAction(
//   playerLocation,
//   playerInventory,
//   playerStats
// );

const State = new GameState();

function GameEngine({ setGameState }) {
  const [terminalLog, setTerminalLog] = useState([
    <TerminalOutput>{`${
      State.playerLocation.describe() +
      getRoomItemDescriptions(
        State.playerLocation.getID(),
        State.items.activeItems
      )
    }`}</TerminalOutput>,
  ]);

  const [helpToggle, setHelpToggle] = useState<boolean>(false);

  return (
    <TerminalLogContext.Provider
      value={{
        terminalLog,
        add: (newLine: string) => {
          setTerminalLog(
            terminalLog.concat([
              <TerminalOutput>{`${newLine}`}</TerminalOutput>,
            ])
          );
        },
      }}
    >
      <div
        className="container rpgui-container rpgui-content framed-grey"
        style={{
          height: "100vh",
        }}
      >
        {helpToggle ? (
          <HelpMenu setHelpToggle={setHelpToggle} />
        ) : (
          <TerminalController
            setGameState={setGameState}
            playerAction={State.playerAction}
            allItems={State.items.activeItems}
            itemsInRoom={{
              keyItems: State.items.activeItems.getKeyItemsForRoom(
                State.playerLocation.getID()
              ),
              weapons: State.items.activeItems.getWeaponsForRoom(
                State.playerLocation.getID()
              ),
            }}
            monsters={State.monsters.getMonstersForRoom(
              State.playerLocation.getID()
            )}
          />
        )}
        <ReadoutGrid
          playerStats={State.playerStats}
          monsters={State.monsters.getMonstersForRoom(
            State.playerLocation.getID()
          )}
          weapons={State.playerInventory.getWeapons()}
          keyItems={State.playerInventory.getKeyItems()}
          spells={State.playerInventory.getSpells()}
          setHelpToggle={setHelpToggle}
        />
      </div>
    </TerminalLogContext.Provider>
  );
}

export default GameEngine;
