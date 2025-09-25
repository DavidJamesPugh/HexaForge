// main.js config module
import componentsModule from "./components.js";
import ResourcesModule from "./resources.js";
import FactoriesModule from "./factories.js";
import ResearchModule from "./research.js";
import upgradesComponent from "./upgrades.js";
import AchievementsClass from "./achievements.js";

const achievements = AchievementsClass.generateAll();

export default {
  id: 0,
  name: "Main idle",
  version: 1,
  startingMoney: 2000,
  minNegativeMoney: -10000,
  startingResearchPoints: 0,
  maxBonusTicks: 7200,
  minBonusTicks: 50,
  offlineSlower: 5,
  incentivizedAdBonusTicks: 1000,
  resources: ResourcesModule,
  components: componentsModule.components,
  componentsSelection: componentsModule.selection,
  productionTree: componentsModule.productionTree,
  factories: FactoriesModule,
  research: ResearchModule,
  upgrades: upgradesComponent.upgrades,
  upgradesLayout: upgradesComponent.layout,
  achievements
};
