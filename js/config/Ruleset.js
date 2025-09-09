define("config/Ruleset", [], function () {
    var e = function () {};
    return (
        (e.prepareMeta = function (e) {
            (e.componentsById = {}), (e.componentsByIdNum = []);
            for (var t in e.components) {
                if (e.componentsById[e.components[t].id]) throw new Error("Component with id " + e.components[t].id + " already exists!");
                if (e.componentsByIdNum[e.components[t].idNum]) throw new Error("Component with idNum " + e.components[t].idNum + " already exists!");
                (e.componentsById[e.components[t].id] = e.components[t]), (e.componentsByIdNum[e.components[t].idNum] = e.components[t]);
            }
            (e.factoriesById = {}), (e.factoriesByIdNum = []);
            for (var t in e.factories) {
                if (e.factoriesById[e.factories[t].id]) throw new Error("Factory with id " + e.factories[t].id + " already exists!");
                if (e.factoriesByIdNum[e.factories[t].idNum]) throw new Error("Factory with idNum " + e.factories[t].idNum + " already exists!");
                (e.factoriesById[e.factories[t].id] = e.factories[t]), (e.factoriesByIdNum[e.factories[t].idNum] = e.factories[t]);
                var n = e.factories[t];
                (n.areasById = {}), (n.areasByIdNum = []);
                for (var t in n.areas) {
                    if (n.areasById[n.areas[t].id]) throw new Error("Factory " + t + " area with id " + n.areas[t].id + " already exists!");
                    if (n.areasByIdNum[n.areas[t].idNum]) throw new Error("Factory " + t + " area with idNum " + n.areas[t].idNum + " already exists!");
                    (n.areasById[n.areas[t].id] = n.areas[t]), (n.areasByIdNum[n.areas[t].idNum] = n.areas[t]);
                    for (var i in n.areas[t].locations) {
                        var r = n.areas[t].locations[i];
                        (r.width = r.x2 - r.x + 1), (r.height = r.y2 - r.y + 1);
                    }
                }
            }
            (e.resourcesById = {}), (e.resourcesByIdNum = []);
            for (var t in e.resources) {
                if (e.resourcesById[e.resources[t].id]) throw new Error("Resource with id " + e.resources[t].id + " already exists!");
                if (e.resourcesByIdNum[e.resources[t].idNum]) throw new Error("Resource with idNum " + e.resources[t].idNum + " already exists!");
                (e.resourcesById[e.resources[t].id] = e.resources[t]), (e.resourcesByIdNum[e.resources[t].idNum] = e.resources[t]);
            }
            (e.researchById = {}), (e.researchByIdNum = []);
            for (var t in e.research) {
                if (e.researchById[e.research[t].id]) throw new Error("Research with id " + e.research[t].id + " already exists!");
                if (e.researchByIdNum[e.research[t].idNum]) throw new Error("Research with idNum " + e.research[t].idNum + " already exists!");
                (e.researchById[e.research[t].id] = e.research[t]), (e.researchByIdNum[e.research[t].idNum] = e.research[t]);
            }
            (e.upgradesById = {}), (e.upgradesByIdNum = []);
            for (var t in e.upgrades) {
                if (e.upgradesById[e.upgrades[t].id]) throw new Error("Upgrade with id " + e.upgrades[t].id + " already exists!");
                if (e.upgradesByIdNum[e.upgrades[t].idNum]) throw new Error("Upgrade with idNum " + e.upgrades[t].idNum + " already exists!");
                (e.upgradesById[e.upgrades[t].id] = e.upgrades[t]), (e.upgradesByIdNum[e.upgrades[t].idNum] = e.upgrades[t]);
            }
            (e.achievementsById = {}), (e.achievementsByIdNum = []);
            for (var t in e.achievements) {
                if (e.achievementsById[e.achievements[t].id]) throw new Error("Achievement with id " + e.achievements[t].id + " already exists!");
                if (e.achievementsByIdNum[e.achievements[t].idNum]) throw new Error("Achievement with idNum " + e.achievements[t].idNum + " already exists!");
                (e.achievementsById[e.achievements[t].id] = e.achievements[t]), (e.achievementsByIdNum[e.achievements[t].idNum] = e.achievements[t]);
            }
            return e;
        }),
        e
    );
});