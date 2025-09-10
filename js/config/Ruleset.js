export default class Ruleset {
    /**
     * Prepares meta object by building lookup tables for all collections
     * @param {Object} meta - Original meta object
     * @returns {Object} meta with added lookup tables
     */
    static prepareMeta(meta) {
      // Helper function to create lookup tables
      const buildLookup = (arr) => {
        if (!arr) {
          throw new Error('buildLookup called with null/undefined');
        }
        if (!Array.isArray(arr)) {
          throw new Error(`buildLookup expected array but got ${typeof arr}:`, arr);
        }
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
      if (meta.components) {
        ({ byId: meta.componentsById, byIdNum: meta.componentsByIdNum } = buildLookup(meta.components));
      }

      // Factories
      if (meta.factories) {
        ({ byId: meta.factoriesById, byIdNum: meta.factoriesByIdNum } = buildLookup(meta.factories));
        for (const factory of meta.factories) {
          if (factory.areas) {
            ({ byId: factory.areasById, byIdNum: factory.areasByIdNum } = buildLookup(factory.areas));
            for (const area of factory.areas) {
              if (area.locations) {
                for (const location of area.locations) {
                  location.width = location.x2 - location.x + 1;
                  location.height = location.y2 - location.y + 1;
                }
              }
            }
          }
        }
      }

      // Resources
      if (meta.resources) {
        ({ byId: meta.resourcesById, byIdNum: meta.resourcesByIdNum } = buildLookup(meta.resources));
      }

      // Research
      if (meta.research) {
        ({ byId: meta.researchById, byIdNum: meta.researchByIdNum } = buildLookup(meta.research));
      }

      // Upgrades
      if (meta.upgrades) {
        ({ byId: meta.upgradesById, byIdNum: meta.upgradesByIdNum } = buildLookup(meta.upgrades));
      }

      // Achievements
      if (meta.achievements) {
        ({ byId: meta.achievementsById, byIdNum: meta.achievementsByIdNum } = buildLookup(meta.achievements));
      }
  
      return meta;
    }
  }
  