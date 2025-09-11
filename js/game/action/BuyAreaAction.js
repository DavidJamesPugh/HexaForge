// src/game/action/BuyAreaAction.js

class BuyAreaAction {
    constructor(factory, areaId) {
      this.factory = factory;
      this.areaId = areaId;
      this.areaMeta = factory.getMeta().areasById[areaId];
    }
  
    canBuy() {
      return this.areaMeta.price <= this.factory.getGame().getMoney();
    }
  
    buy() {
      this.factory.getGame().addMoney(-this.areaMeta.price);
      this.factory.getAreasManager().setAreaBought(this.areaId, true);
    }
  }
  
  export default BuyAreaAction;
  