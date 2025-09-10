// main.js config module
import * as ComponentsModule from "./components.js";
import ResourcesModule from "./resources.js";
import FactoriesModule from "./factories.js";
import ResearchModule from "./research.js";
import * as UpgradesModule from "./upgrades.js";
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
  components: ComponentsModule.components,
  componentsSelection: ComponentsModule.selection,
  productionTree: ComponentsModule.productionTree,
  factories: FactoriesModule,
  research: ResearchModule,
  upgrades: UpgradesModule.upgrades,
  upgradesLayout: UpgradesModule.layout,
  achievements
};
