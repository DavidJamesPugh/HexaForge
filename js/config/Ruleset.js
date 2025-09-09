define("config/Ruleset", [], function () {

    class Ruleset {
        static prepareMeta(meta) {

            // Helper function to create lookup tables
            const buildLookup = (arr) => {
                const byId = {};
                const byIdNum = [];
                for (const item of arr) {
                    if (byId[item.id]) throw new Error(`Duplicate id: ${item.id}`);
                    if (byIdNum[item.idNum]) throw new Error(`Duplicate idNum: ${item.idNum}`);
                    byId[item.id] = item;
                    byIdNum[item.idNum] = item;
                }
                return { byId, byIdNum };
            };

            // Components
            ({ byId: meta.componentsById, byIdNum: meta.componentsByIdNum } = buildLookup(meta.components));

            // Factories
            ({ byId: meta.factoriesById, byIdNum: meta.factoriesByIdNum } = buildLookup(meta.factories));
            for (const factory of meta.factories) {
                ({ byId: factory.areasById, byIdNum: factory.areasByIdNum } = buildLookup(factory.areas));
                for (const area of factory.areas) {
                    for (const location of area.locations) {
                        location.width = location.x2 - location.x + 1;
                        location.height = location.y2 - location.y + 1;
                    }
                }
            }

            // Resources
            ({ byId: meta.resourcesById, byIdNum: meta.resourcesByIdNum } = buildLookup(meta.resources));

            // Research
            ({ byId: meta.researchById, byIdNum: meta.researchByIdNum } = buildLookup(meta.research));

            // Upgrades
            ({ byId: meta.upgradesById, byIdNum: meta.upgradesByIdNum } = buildLookup(meta.upgrades));

            // Achievements
            ({ byId: meta.achievementsById, byIdNum: meta.achievementsByIdNum } = buildLookup(meta.achievements));

            return meta;
        }
    }

    return Ruleset;
});
