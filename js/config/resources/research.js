// Research configuration extracted from app.js
// This contains all research items, their properties, and requirements

// Helper function for price calculations (e.g., e(50, 2) = 50 * 1000^2 = 50,000,000)
const calculateResearchPrice = (base, multiplier) => {
  return base * Math.pow(1000, multiplier);
};

const research = [
  { 
    id: "researchCenter", 
    idNum: 13, 
    name: "Research center", 
    iconX: 0, 
    iconY: 0, 
    description: "Allows researching more technologies", 
    price: 900, 
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "" 
  },
  { 
    id: "chronometer", 
    idNum: 1, 
    name: "Chronometer", 
    iconX: 1, 
    iconY: 0, 
    description: "Each level gives +1 tick/sec", 
    priceResearchPoints: 50, 
    priceIncrease: 50, 
    max: 10, 
    requiresResearch: "researchCenter" 
  },
  { 
    id: "steelComponents", 
    idNum: 2, 
    name: "Steel components", 
    iconX: 2, 
    iconY: 0, 
    description: "Allows steel production", 
    priceResearchPoints: 200, 
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "researchCenter" 
  },
  { 
    id: "metalsLab", 
    idNum: 14, 
    name: "Metals lab", 
    iconX: 3, 
    iconY: 0, 
    description: "Allows researching metals", 
    priceResearchPoints: 2000, 
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "steelComponents" 
  },
  { 
    id: "plasticComponents", 
    idNum: 3, 
    name: "Plastic components", 
    iconX: 4, 
    iconY: 0, 
    description: "Allows plastic production", 
    priceResearchPoints: calculateResearchPrice(160, 1), // 160,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "steelComponents" 
  },
  { 
    id: "sorter", 
    idNum: 16, 
    name: "Sorter", 
    iconX: 5, 
    iconY: 0, 
    description: "Sorts resources on lines to different paths", 
    priceResearchPoints: calculateResearchPrice(120, 1), // 120,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "plasticComponents" 
  },
  {
    id: "electronicsComponents",
    idNum: 4,
    name: "Electronics components",
    iconX: 6,
    iconY: 0,
    description: "Allows electronics production",
    priceResearchPoints: calculateResearchPrice(20, 2), // 20,000,000
    priceIncrease: 1,
    max: 1,
    requiresResearch: "plasticComponents",
  },
  { 
    id: "gasAndOilLab", 
    idNum: 15, 
    name: "Gas&Oil lab", 
    iconX: 7, 
    iconY: 0, 
    description: "Allows researching gas and oil", 
    priceResearchPoints: calculateResearchPrice(300, 1), // 300,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "plasticComponents" 
  },
  { 
    id: "gunComponents", 
    idNum: 8, 
    name: "Gun components", 
    iconX: 0, 
    iconY: 1, 
    description: "Allows guns production", 
    priceResearchPoints: calculateResearchPrice(150, 2), // 150,000,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "electronicsComponents" 
  },
  {
    id: "cleanPlastic",
    idNum: 5,
    name: "Clean plastic production",
    iconX: 1,
    iconY: 1,
    description: "Plastic production will not produce waste",
    priceResearchPoints: calculateResearchPrice(15, 2), // 15,000,000
    priceIncrease: 1,
    max: 1,
    requiresResearch: "electronicsComponents",
  },
  { 
    id: "engineComponents", 
    idNum: 6, 
    name: "Engine components", 
    iconX: 2, 
    iconY: 1, 
    description: "Allows engines production", 
    priceResearchPoints: calculateResearchPrice(2.5, 3), // 2,500,000,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "gunComponents" 
  },
  { 
    id: "analystCenter", 
    idNum: 17, 
    name: "Analytics center", 
    iconX: 3, 
    iconY: 0, 
    description: "Provides higher quality research", 
    priceResearchPoints: calculateResearchPrice(250, 2), // 250,000,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "gunComponents" 
  },
  { 
    id: "tankComponents", 
    idNum: 9, 
    name: "Tank components", 
    iconX: 4, 
    iconY: 1, 
    description: "Allows tanks production", 
    priceResearchPoints: calculateResearchPrice(20, 3), // 20,000,000,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "engineComponents" 
  },
  {
    id: "cleanElectronics",
    idNum: 7,
    name: "Clean electronics",
    iconX: 5,
    iconY: 1,
    description: "Electronics production will not produce waste",
    priceResearchPoints: calculateResearchPrice(700, 2), // 700,000,000
    priceIncrease: 1,
    max: 1,
    requiresResearch: "engineComponents",
  },
  { 
    id: "dieselRefinery", 
    idNum: 10, 
    name: "Diesel refinery", 
    iconX: 5, 
    iconY: 1, 
    description: "Diesel increases tanks value.", 
    priceResearchPoints: calculateResearchPrice(75, 3), // 75,000,000,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "tankComponents" 
  },
  { 
    id: "rocketComponents", 
    idNum: 11, 
    name: "Rocket components", 
    iconX: 6, 
    iconY: 1, 
    description: "Allows producing rockets", 
    priceResearchPoints: calculateResearchPrice(1, 4), // 1,000,000,000,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "dieselRefinery" 
  },
  { 
    id: "qualityCenter", 
    idNum: 19, 
    name: "Quality center", 
    iconX: 9, 
    iconY: 1, 
    description: "Provides higher quality research", 
    priceResearchPoints: calculateResearchPrice(2, 4), // 2,000,000,000,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "rocketComponents" 
  },
  {
    id: "cleanEngines",
    idNum: 12,
    name: "Clean engines",
    iconX: 7,
    iconY: 1,
    description: "Engine makers production will not produce waste",
    priceResearchPoints: calculateResearchPrice(1, 4), // 1,000,000,000,000
    priceIncrease: 1,
    max: 1,
    requiresResearch: "rocketComponents",
  },
  { 
    id: "droneComponents", 
    idNum: 18, 
    name: "Drone components", 
    iconX: 8, 
    iconY: 1, 
    description: "Allows producing drones", 
    priceResearchPoints: calculateResearchPrice(99, 4), // 99,000,000,000,000
    priceIncrease: 1, 
    max: 1, 
    requiresResearch: "rocketComponents" 
  },
];

// Helper functions to get research information
export function getResearchById(researchId) {
  return research.find(item => item.id === researchId);
}

export function getResearchByIdNum(idNum) {
  return research.find(item => item.idNum === idNum);
}

export function getAllResearch() {
  return research;
}

export function getResearchByRequirement(requiredResearch) {
  return research.filter(item => item.requiresResearch === requiredResearch);
}

export function getResearchPrice(researchId) {
  const item = getResearchById(researchId);
  return item ? item.priceResearchPoints : null;
}

export function getResearchMaxLevel(researchId) {
  const item = getResearchById(researchId);
  return item ? item.max : null;
}

export function getResearchIcon(researchId) {
  const item = getResearchById(researchId);
  return item ? { x: item.iconX, y: item.iconY } : null;
}

export function getResearchDescription(researchId) {
  const item = getResearchById(researchId);
  return item ? item.description : null;
}

export function getResearchRequirements(researchId) {
  const item = getResearchById(researchId);
  return item ? item.requiresResearch : null;
}

export function getResearchTree() {
  // Build a dependency tree for research
  const tree = {};
  
  research.forEach(item => {
    if (item.requiresResearch) {
      if (!tree[item.requiresResearch]) {
        tree[item.requiresResearch] = [];
      }
      tree[item.requiresResearch].push(item.id);
    }
  });
  
  return tree;
}

export function getResearchByCategory() {
  // Group research by logical categories
  const categories = {
    basic: ["researchCenter", "chronometer"],
    materials: ["steelComponents", "plasticComponents", "electronicsComponents"],
    military: ["gunComponents", "tankComponents", "rocketComponents"],
    advanced: ["engineComponents", "droneComponents"],
    labs: ["metalsLab", "gasAndOilLab", "analystCenter", "qualityCenter"],
    efficiency: ["cleanPlastic", "cleanElectronics", "cleanEngines"],
    logistics: ["sorter", "dieselRefinery"]
  };
  
  return categories;
}

export default research;
