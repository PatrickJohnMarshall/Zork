import PlayerMove from "./action/PlayerMove";
import PlayerAttack from "./action/PlayerAttack";
import PlayerCast from "./action/PlayerCast";

import Monster from "../monsters/types/Monster";
import monsterDamage from "../monsters/monsterDamage";

import KeyItems from "items/types/KeyItems";
import Weapon from "items/types/Weapon";

import IPlayerLocation from "./types/IPlayerLocation";
import IPlayerInventory from "./types/IPlayerInventory";
import IPlayerStats from "./types/IPlayerStats";
import {
  EventType,
  AttackHit,
  AttackKill,
  AttackMiss,
  AttackAlreadyDead,
  SpellHit,
  SpellKill,
  SpellMiss,
  SpellAlreadyDead,
  LocationDescription,
  AddedToInventory,
  MiscStatus,
} from "./types/ActionEventTypes";

type ActionReturn = {
  event: EventType;
  eventData:
    | AttackHit
    | AttackKill
    | AttackMiss
    | AttackAlreadyDead
    | SpellHit
    | SpellKill
    | SpellMiss
    | SpellAlreadyDead
    | LocationDescription
    | AddedToInventory
    | MiscStatus
    | null;
};
class PlayerAction {
  #playerLocation;
  #playerInventory;
  #playerStats;

  constructor(
    playerLocation: IPlayerLocation,
    playerInventory: IPlayerInventory,
    playerStats: IPlayerStats
  ) {
    this.#playerLocation = playerLocation;
    this.#playerInventory = playerInventory;
    this.#playerStats = playerStats;
  }

  action({
    answer,
    validMonsters,
    keyItems,
    weapons,
  }: {
    answer: string;
    validMonsters: Monster[];
    keyItems: KeyItems[];
    weapons: Weapon[];
  }): ActionReturn {
    const commands = answer.toLowerCase().split(" ");
    const validAnswer = this._validateCommand(commands[0]);

    if (!validAnswer) {
      return { event: "INVALID", eventData: { status: "INVALID_COMMAND" } };
    }

    return this._doAction({
      primaryCommand: commands[0],
      secondaryCommand: commands[1],
      fourthCommand: commands[3],
      validMonsters,
      keyItems,
      weapons,
    });
  }

  _validateCommand(command: string): boolean {
    const validCommands = [
      "quit",
      "move",
      "attack",
      "look",
      "cast",
      "take",
      "equip",
    ];

    return !!validCommands.find((c) => c === command);
  }

  _doAction({
    primaryCommand,
    secondaryCommand,
    fourthCommand,
    validMonsters,
    keyItems,
    weapons,
  }: {
    primaryCommand: string;
    secondaryCommand: string;
    fourthCommand: string | undefined;
    validMonsters: Monster[];
    keyItems: KeyItems[];
    weapons: Weapon[];
  }): ActionReturn {
    switch (primaryCommand) {
      case "look":
        return {
          event: "LOOK",
          eventData: {
            location: this.#playerLocation.getID(),
            description: this.#playerLocation.describe(),
          },
        };

      case "move":
        // secondaryCommand is a direction

        if (!secondaryCommand.match(/^(left|right|forward|back|up|down)$/)) {
          return {
            event: "INVALID",
            eventData: { status: "INVALID_MOVEMENT" },
          };
        }

        const playerMove = new PlayerMove(
          this.#playerLocation,
          secondaryCommand
        );

        playerMove.move();

        return {
          event: "MOVE",
          eventData: {
            location: this.#playerLocation.getID(),
            description: this.#playerLocation.describe(),
          },
        };

      case "take":
        return this._AddItemToInventory({
          itemID: secondaryCommand,
          keyItems: keyItems,
          weapons: weapons,
        });

      case "equip":
        this.#playerInventory.equipWeapon(secondaryCommand);
        const weaponToAdd = this.#playerInventory
          .getWeapons()
          .find((item) => item.getID() === secondaryCommand);

        if (!weaponToAdd) {
          return {
            event: "INVALID",
            eventData: {
              status: "NOTHING_TO_EQUIP",
            },
          };
        }

        return {
          event: "EQUIP",
          eventData: {
            itemName: weaponToAdd.getID(),
          },
        };

      case "attack":
        return this._doWeaponAttack(secondaryCommand, validMonsters);

      case "cast":
        return this._doSpellAttack(
          secondaryCommand,
          fourthCommand,
          validMonsters
        );

      case "quit":
        return { event: "QUIT", eventData: { status: "quit" } };

      default:
        throw new Error("Invalid Command");
    }
  }

  _AddItemToInventory({
    itemID,
    keyItems,
    weapons,
  }: {
    itemID: string;
    keyItems: KeyItems[];
    weapons: Weapon[];
  }): ActionReturn {
    const keyItemToAdd = keyItems.find((item) => item.getID() === itemID);
    const weaponToAdd = weapons.find((item) => item.getID() === itemID);

    if (keyItemToAdd) {
      this.#playerInventory.addKeyItem(keyItemToAdd);
      return {
        event: "TAKE",
        eventData: { itemName: keyItemToAdd.getID() },
      };
    }

    if (weaponToAdd) {
      this.#playerInventory.addWeapon(weaponToAdd);
      return {
        event: "TAKE",
        eventData: { itemName: weaponToAdd.getID() },
      };
    }

    return {
      event: "INVALID",
      eventData: { status: "NOTHING_TO_TAKE" },
    };
  }

  _doWeaponAttack(secondaryCommand, validMonsters): ActionReturn {
    const targetMonster = validMonsters.find(
      (monster) =>
        monster.getID() === secondaryCommand.toLowerCase().replace(" ", "")
    );

    if (!targetMonster) {
      return {
        event: "INVALID",
        eventData: { status: "INVALID_ATTACK_TARGET" },
      };
    }

    const playerAttack = new PlayerAttack(this.#playerInventory);

    const attackResults = playerAttack.attack();

    const didHit = monsterDamage(
      targetMonster,
      attackResults.attackValue,
      attackResults.damageValue
    );

    if (didHit === "Already Dead") {
      return {
        event: "ATTACK_ALREADY_DEAD",
        eventData: { monsterName: targetMonster.getName() },
      };
    }

    if (didHit === "Struck" && targetMonster.getHP() <= 0) {
      return {
        event: "ATTACK_KILL",
        eventData: {
          attackValue: attackResults.attackValue,
          damageValue: attackResults.damageValue,
          weaponName: this.#playerInventory.getEquippedWeaponID(),
          monsterName: targetMonster.getName(),
        },
      };
    }

    if (didHit === "Struck") {
      return {
        event: "ATTACK_HIT",
        eventData: {
          attackValue: attackResults.attackValue,
          damageValue: attackResults.damageValue,
          weaponName: this.#playerInventory.getEquippedWeaponID(),
          monsterName: targetMonster.getName(),
          monsterHP: targetMonster.getHP(),
        },
      };
    }

    return {
      event: "ATTACK_MISS",
      eventData: {
        attackValue: attackResults.attackValue,
        weaponName: this.#playerInventory.getEquippedWeaponID(),
        monsterName: targetMonster.getName(),
      },
    };
  }

  _doSpellAttack(secondaryCommand, spellTarget, validMonsters): ActionReturn {
    const targetMonster = validMonsters.find(
      (monster) =>
        monster.getID() === secondaryCommand.toLowerCase().replace(" ", "")
    );

    if (!targetMonster) {
      return {
        event: "INVALID",
        eventData: { status: "INVALID_SPELL_TARGET" },
      };
    }

    const playerCast = new PlayerCast(this.#playerInventory);

    this.#playerStats.changeMana(-1);

    const attackResults = playerCast.attack(secondaryCommand);

    const didHit = monsterDamage(
      targetMonster,
      attackResults.attackValue,
      attackResults.damageValue
    );

    if (didHit === "Already Dead") {
      return {
        event: "SPELL_ALREADY_DEAD",
        eventData: {
          monsterName: targetMonster.getName(),
          spellName: secondaryCommand,
        },
      };
    }

    if (didHit === "Struck" && targetMonster.getHP() <= 0) {
      return {
        event: "SPELL_KILL",
        eventData: {
          spellName: secondaryCommand,
          attackValue: attackResults.attackValue,
          damageValue: attackResults.damageValue,
          monsterName: targetMonster.getName(),
        },
      };
    }

    if (didHit === "Struck") {
      return {
        event: "SPELL_HIT",
        eventData: {
          spellName: secondaryCommand,
          attackValue: attackResults.attackValue,
          damageValue: attackResults.damageValue,
          monsterName: targetMonster.getName(),
          monsterHP: targetMonster.getHP(),
        },
      };
    }

    return {
      event: "SPELL_MISS",
      eventData: {
        spellName: secondaryCommand,
        attackValue: attackResults.attackValue,
        monsterName: targetMonster.getName(),
      },
    };
  }
}

export default PlayerAction;
