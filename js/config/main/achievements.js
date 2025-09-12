// achievements.js
export default class Achievements {
    /** Generate all achievements */
    static generateAll() {
        const achievements = [
            {
                id: "makingProfit",
                idNum: 0,
                name: "Making profit!",
                spriteX: 3,
                spriteY: 0,
                bonus: { type: "custom", description: "Unlocks research" },
                tests: [{ type: "avgMoneyIncome", amount: 1.4 }]
            },
            {
                id: "collectingCash",
                idNum: 1,
                name: "Collecting some cash",
                spriteX: 2,
                spriteY: 0,
                bonus: { type: "custom", description: "Unlocks extras" },
                tests: [{ type: "amountOfMoney", amount: 25000 }]
            },
            {
                id: "gettingSmarter",
                idNum: 2,
                name: "Getting smarter",
                spriteX: 2,
                spriteY: 0,
                bonus: { type: "custom", description: "Unlocks upgrades" },
                tests: [{ type: "researched", researchId: "researchCenter" }]
            }
        ];

        for (let i = 1; i <= 20; i++) {
            achievements.push({
                id: `money${i}`,
                idNum: 2 + i,
                name: "Getting money",
                spriteX: 2,
                spriteY: 0,
                requiresAchievement: i > 1 ? `money${i - 1}` : null,
                bonus: { type: "money", amount: 250 * Math.pow(10, i) },
                tests: [{ type: "amountOfMoney", amount: 1000 * Math.pow(10, i) }]
            });
        }

        return achievements;
    }
}
