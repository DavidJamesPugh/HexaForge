// Achievements configuration extracted from app.js
// This contains all achievements, their properties, and unlock conditions

const achievements = [
  { 
    id: "makingProfit", 
    idNum: 1, 
    name: "Making profit!", 
    spriteX: 3, 
    spriteY: 0, 
    bonus: { type: "custom", description: "Unlocks research" }, 
    tests: [{ type: "avgMoneyIncome", amount: 1.4 }] 
  },
  { 
    id: "collectingCash", 
    idNum: 2, 
    name: "Collecting some cash", 
    spriteX: 2, 
    spriteY: 0, 
    bonus: { type: "custom", description: "Unlocks extras" }, 
    tests: [{ type: "amountOfMoney", amount: 25000 }] 
  },
  { 
    id: "gettingSmarter", 
    idNum: 3, 
    name: "Getting smarter", 
    spriteX: 2, 
    spriteY: 0, 
    bonus: { type: "custom", description: "Unlocks upgrades" }, 
    tests: [{ type: "researched", researchId: "researchCenter" }] 
  },
];

// Generate money achievements (money1 through money20)
for (let i = 1; i <= 20; i++) {
  achievements.push({
    id: "money" + i,
    idNum: 4 + i,
    name: "Getting money",
    spriteX: 2,
    spriteY: 0,
    requiresAchievement: i > 1 ? "money" + (i - 1) : null,
    bonus: { type: "money", amount: 250 * Math.pow(10, i) },
    tests: [{ type: "amountOfMoney", amount: 1000 * Math.pow(10, i) }],
  });
}

// Helper functions to get achievement information
export function getAchievementById(achievementId) {
  return achievements.find(achievement => achievement.id === achievementId);
}

export function getAchievementByIdNum(idNum) {
  return achievements.find(achievement => achievement.idNum === idNum);
}

export function getAllAchievements() {
  return achievements;
}

export function getAchievementsByType(type) {
  return achievements.filter(achievement => {
    if (type === "money") {
      return achievement.id.startsWith("money");
    }
    return achievement.bonus.type === type;
  });
}

export function getAchievementBonus(achievementId) {
  const achievement = getAchievementById(achievementId);
  return achievement ? achievement.bonus : null;
}

export function getAchievementTests(achievementId) {
  const achievement = getAchievementById(achievementId);
  return achievement ? achievement.tests : [];
}

export function getAchievementRequirements(achievementId) {
  const achievement = getAchievementById(achievementId);
  return achievement ? achievement.requiresAchievement : null;
}

export function getAchievementSprite(achievementId) {
  const achievement = getAchievementById(achievementId);
  return achievement ? { x: achievement.spriteX, y: achievement.spriteY } : null;
}

export function getMoneyAchievements() {
  return getAchievementsByType("money");
}

export function getCustomAchievements() {
  return achievements.filter(achievement => achievement.bonus.type === "custom");
}

export default achievements;
