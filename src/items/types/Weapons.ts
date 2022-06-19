// Weapons, Armor, Consumable, UtilityItems, KeyItems

interface Weapon {
  getID: () => string;
  getAttackStats: () => {
    attackBonus: number;
    damage: { min: number; max: number };
  };
  describe: () => void;
}

export default Weapon;
