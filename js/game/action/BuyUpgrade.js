// src/game/action/BuyUpgrade.js
export default class BuyUpgrade {
    constructor(factory, upgradeId) {
      this.factory = factory;
      this.game = factory.getGame();
      this.upgradeId = upgradeId;
    }
  
    canBuy() {
      return this.factory.getUpgradesManager().canPurchase(this.upgradeId);
    }
  
    buy() {
      const price = this.factory.getUpgradesManager().getPrice(this.upgradeId);
      this.game.addMoney(-price);
      this.factory.getUpgradesManager().addUpgrade(this.upgradeId, 1);
      this.factory.getEventManager().invokeEvent(FactoryEvent.UPGRADE_BOUGHT, this.upgradeId);
    }
  }
  