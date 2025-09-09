
define("config/main/main", [
    "./components",
    "./resources",
    "./factories",
    "./research",
    "./upgrades",
    "./achievements"
], function (components, resources, factories, research, upgrades, AchievementsClass) {

    const achievements = AchievementsClass.generateAll();

    return {
        id: 0,
        name: "Main idle",
        version: 1,
        startingMoney: 2_000,
        minNegativeMoney: -10_000,
        startingResearchPoints: 0,
        maxBonusTicks: 7200,
        minBonusTicks: 50,
        offlineSlower: 5,
        incentivizedAdBonusTicks: 1_000,
        resources,
        components: components.components,
        componentsSelection: components.selection,
        productionTree: components.productionTree,
        factories,
        research,
        upgrades: upgrades.upgrades,
        upgradesLayout: upgrades.layout,
        achievements // dynamically generated
    };
});
