
  // src/game/action/SellUpgrade.js
  export default class SellUpgrade {
    constructor(factory, upgradeId) {
      this.factory = factory;
      this.game = factory.getGame();
      this.upgradeId = upgradeId;
    }
  
    canSell() {
      return this.factory.getUpgradesManager().canSell(this.upgradeId);
    }
  
    sell() {
      const price = this.factory.getUpgradesManager().getSellPrice(this.upgradeId);
      this.game.addMoney(price);
      this.factory.getUpgradesManager().addUpgrade(this.upgradeId, -1);
    }
  }