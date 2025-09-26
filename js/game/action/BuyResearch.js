// src/game/action/BuyResearch.js
import GameEvent from "../../config/event/GameEvent";
export default class BuyResearch {
    constructor(game, researchId) {
      this.game = game;
      this.researchId = researchId;
    }
  
    canBuy() {
      return this.game.getResearchManager().canPurchase(this.researchId);
    }
  
    buy() {
      const rm = this.game.getResearchManager();
      this.game.addMoney(-rm.getPrice(this.researchId));
      this.game.addResearchPoints(-rm.getPriceResearchPoints(this.researchId));
      rm.addResearch(this.researchId, 1);
      this.game.getEventManager().invokeEvent(GameEvent.RESEARCH_BOUGHT, this.researchId);
    }
  }
  