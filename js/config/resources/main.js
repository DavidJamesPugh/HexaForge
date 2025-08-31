// Main configuration file that aggregates all game configuration modules
// This is the central configuration hub for the entire game

import components from './components.js';
import resources from './resources.js';
import factories from './factories.js';
import research from './research.js';
import upgrades from './upgrades.js';
import achievements from './achievements.js';

const mainConfig = {
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
  resources: resources,
  components: components.components,
  componentsSelection: components.selection,
  productionTree: components.productionTree,
  factories: factories,
  research: research,
  upgrades: upgrades.upgrades,
  upgradesLayout: upgrades.layout,
  achievements: achievements,
};

// Helper functions to access main configuration
export function getMainConfig() {
  return mainConfig;
}

export function getGameVersion() {
  return mainConfig.version;
}

export function getGameName() {
  return mainConfig.name;
}

export function getStartingMoney() {
  return mainConfig.startingMoney;
}

export function getMinNegativeMoney() {
  return mainConfig.minNegativeMoney;
}

export function getStartingResearchPoints() {
  return mainConfig.startingResearchPoints;
}

export function getMaxBonusTicks() {
  return mainConfig.maxBonusTicks;
}

export function getMinBonusTicks() {
  return mainConfig.minBonusTicks;
}

export function getOfflineSlower() {
  return mainConfig.offlineSlower;
}

export function getIncentivizedAdBonusTicks() {
  return mainConfig.incentivizedAdBonusTicks;
}

export function getResources() {
  return mainConfig.resources;
}

export function getComponents() {
  return mainConfig.components;
}

export function getComponentSelection() {
  return mainConfig.componentsSelection;
}

export function getProductionTree() {
  return mainConfig.productionTree;
}

export function getFactories() {
  return mainConfig.factories;
}

export function getResearch() {
  return mainConfig.research;
}

export function getUpgrades() {
  return mainConfig.upgrades;
}

export function getUpgradesLayout() {
  return mainConfig.upgradesLayout;
}

export function getAchievements() {
  return mainConfig.achievements;
}

// Convenience functions for common operations
export function getGameConfig() {
  return {
    version: mainConfig.version,
    name: mainConfig.name,
    startingMoney: mainConfig.startingMoney,
    minNegativeMoney: mainConfig.minNegativeMoney,
    startingResearchPoints: mainConfig.startingResearchPoints,
    maxBonusTicks: mainConfig.maxBonusTicks,
    minBonusTicks: mainConfig.minBonusTicks,
    offlineSlower: mainConfig.offlineSlower,
    incentivizedAdBonusTicks: mainConfig.incentivizedAdBonusTicks,
  };
}

export function getGameBalance() {
  return {
    startingMoney: mainConfig.startingMoney,
    minNegativeMoney: mainConfig.minNegativeMoney,
    startingResearchPoints: mainConfig.startingResearchPoints,
    maxBonusTicks: mainConfig.maxBonusTicks,
    minBonusTicks: mainConfig.minBonusTicks,
    offlineSlower: mainConfig.offlineSlower,
    incentivizedAdBonusTicks: mainConfig.incentivizedAdBonusTicks,
  };
}

export default mainConfig;
