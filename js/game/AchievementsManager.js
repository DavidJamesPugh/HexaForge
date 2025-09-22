// src/game/AchievementsManager.js
import GameEvent from "../config/event/GameEvent.js";
import BinaryArrayWriter from "../base/BinaryArrayWriter.js";
import numberFormat from "../base/NumberFormat.js";
import { lcFirst } from "/js/utils/stringHelpers.js"

export default class AchievementsManager {
  constructor(game) {
    this.game = game;
    this.achievements = {}; // stores achievement states
    this.testers = this.getTesterImplementations();
    this.bonuses = this.getBonusImplementations();
  }

  // --- Achievement state management ---
  _setAchieved(achievementId, value) {
    this.achievements[achievementId] = value;
  }

  setAchieved(achievementId, value) {
    this._setAchieved(achievementId, value);
    if (value) {
      this.game
        .getEventManager()
        .invokeEvent(GameEvent.ACHIEVEMENT_RECEIVED, achievementId);
    }
  }

  getAchievement(achievementId) {
    return this.achievements[achievementId];
  }

  isVisible(achievementId) {
    const achievement = this.game.getMeta().achievementsById[achievementId];
    return !(
      achievement.requiresAchievement &&
      !this.getAchievement(achievement.requiresAchievement)
    );
  }

  // --- Achievement testing ---
  getTester(achievementTest) {
    return this.testers[achievementTest.type].test(achievementTest);
  }

  test(achievement) {
    return achievement.tests.every((test) =>
      this.testers[test.type].test(test)
    );
  }

  testAll() {
    const allAchievements = this.game.getMeta().achievements;
    for (const achievement of allAchievements) {
      if (!this.getAchievement(achievement.id) && this.test(achievement)) {
        this.setAchieved(achievement.id, true);
        if (achievement.bonus) {
          this.bonuses[achievement.bonus.type].invoke(achievement.bonus);
        }
      }
    }
  }

  getTesterDescriptionText(achievementId) {
    const achievement = this.game.getMeta().achievementsById[achievementId];
    if (!achievement) return [];
    return achievement.tests.map((test) =>
      this.testers[test.type].getRequirementsInfoText(test)
    );
  }

  getBonusDescriptionText(achievementId) {
    const achievement = this.game.getMeta().achievementsById[achievementId];
    if (!achievement || !achievement.bonus) return "";
    return this.bonuses[achievement.bonus.type].getInfoText(achievement.bonus);
  }

  // --- Tester implementations ---
  getTesterImplementations() {
    const researchById =  this.game.getMeta().researchById;
    return {
      amountOfMoney: {
        getRequirementsInfoText: (test) =>
          `Have more money than <span class="money">$${numberFormat.formatNumber(
            test.amount
          )}</span>`,
        test: (test) => this.game.getMoney() > test.amount,
      },
      avgMoneyIncome: {
        getRequirementsInfoText: (test) =>
          `Have avg income greater than <span class="money">$${numberFormat.formatNumber(
            test.amount
          )}</span>`,
        test: (test) =>
          this.game.getStatistics().getAvgProfit() > test.amount,
      },
      researched: {
        getRequirementsInfoText: (test) =>
          `Research ${lcFirst(researchById[test.researchId].name)}`,
        test: (test) =>
          this.game.getResearchManager().getResearch(test.researchId) > 0,
      },
    };
  }

  // --- Bonus implementations ---
  getBonusImplementations() {
    return {
      money: {
        getInfoText: (bonus) =>
          `<span class="money">+$${numberFormat.formatNumber(
            bonus.amount
          )}</span>`,
        invoke: (bonus) => this.game.addMoney(bonus.amount),
      },
      custom: {
        getInfoText: (bonus) => bonus.description,
        invoke: () => {}, // no-op
      },
    };
  }

  // --- Export / Import achievements state ---
  exportToWriter() {
    const writer = new BinaryArrayWriter();
    const achievements = this.game.getMeta().achievementsByIdNum;

    writer.writeUint16(achievements.length);
    writer.writeBooleansArrayFunc(achievements, (achievement) =>
      this.getAchievement(achievement.id)
    );
    
    return writer;
  }

  importFromReader(reader) {
    if (reader.getLength() === 0) return;

    const length = reader.readUint16();
    this.achievements = {};
    console.log("Achievements.import: length=", length, "bufferLen=", reader.getLength());

    reader.readBooleanArrayFunc(length, (index, value) => {
      if (value) {
        const achievement = this.game.getMeta().achievementsByIdNum[index];
        if (achievement) this._setAchieved(achievement.id, true);
      }
    });
    const achieved = Object.keys(this.achievements).length;
    console.log("Achievements.import: achieved count=", achieved);
  }
}
