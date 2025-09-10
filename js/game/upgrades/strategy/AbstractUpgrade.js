export default class AbstractUpgrade {
    getNextMultiplier() {
      return this.meta.levels[this.amount] ? this.meta.levels[this.amount].bonus : 0;
    }
  
    getTotalMultiplier() {
      let total = 0;
      for (let i = 0; i < this.amount; i++) {
        const level = this.meta.levels[i];
        if (level) total += level.bonus;
      }
      return total;
    }
  
    getMultiplierStrings(percent = false) {
      const next = this.getNextMultiplier();
      const total = 1 + this.getTotalMultiplier();
      let increase = 0;
      if (next > 0) increase = (total + next) / total - 1;
      const rounded = Math.round(increase * 10000) / 100;
  
      return percent
        ? { total: `${Math.round((total - 1) * 10000) / 100}%`, next: `<b>${rounded}%</b>` }
        : { total: `${total}x`, next: `<b>${rounded}%</b>` };
    }
  }
