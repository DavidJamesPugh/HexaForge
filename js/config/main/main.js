define("config/main/main", [
        "./components",
        "./resources",
        "./factories",
        "./research",
        "./upgrades",
        "./achievements"
    ], function (components, resources, factories, research, upgrades, achievements) {
            return {
                id: 0,
                name: "Main idle",
                version: 1,
                startingMoney: 2e3,
                minNegativeMoney: -1e4,
                startingResearchPoints: 0,
                maxBonusTicks: 7200,
                minBonusTicks: 50,
                offlineSlower: 5,
                incentivizedAdBonusTicks: 1e3,
                resources: resources,
                components: components.components,
                componentsSelection: components.selection,
                productionTree: components.productionTree,
                factories: factories,
                research: research,
                upgrades: upgrades.upgrades,
                upgradesLayout: r.layout,
                achievements: achievements,
            };
        });