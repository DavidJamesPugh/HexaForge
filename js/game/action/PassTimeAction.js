// game/action/PassTimeAction.js
export default class PassTimeAction {
    constructor(game, seconds) {
      this.game = game;
      this.seconds = seconds;
  
      const ticksPerSec = this.game.getTicker().getNormalTicksPerSec();
      this.ticks = this.seconds * ticksPerSec;
  
      const stats = this.game.getStatistics();
      this.profit = stats.getAvgProfit() * this.ticks;
      this.researchPoints = stats.getAvgResearchPointsProduction() * this.ticks;
    }
  
    getTicks() {
      return this.ticks;
    }
  
    getProfit() {
      return this.profit;
    }
  
    getResearchPoints() {
      return this.researchPoints;
    }
  
    canPassTime() {
      return this.game.getTicker().getTimeTravelTickets() > 0;
    }
  
    passTime() {
      const ticker = this.game.getTicker();
      this.game.addMoney(this.profit);
      this.game.addResearchPoints(this.researchPoints);
      ticker.addNoOfTicks(this.ticks);
  
      if (ticker.getTimeTravelTickets() > 0) {
        ticker.addTimeTravelTickets(-1);
      }
    }
  }
  