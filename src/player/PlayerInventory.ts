import Weapon from '../items/types/weapons';

class PlayerInventory {
  #weapons: Weapon[] = [];

  addWeapons(weapon: Weapon) {
    this.#weapons.push(weapon);
  }

  getWeapons(): Weapon[] {
    return this.#weapons;
  }
}

export default PlayerInventory;
