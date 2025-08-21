// Components configuration extracted from app.js
// This contains all factory components, their properties, and production relationships

// Helper function for price calculations (e.g., t(50, 2) = 50 * 1000^2 = 50,000,000)
const calculatePrice = (base, multiplier) => {
  return base * Math.pow(1000, multiplier);
};

const components = {
  // Component selection layout for the UI
  selection: [
    ["noComponent", "transportLine", "garbageCollector", "sorterVertical", "sorterHorizontal"],
    ["ironBuyer", "ironFoundry", "ironSeller", null, "coalBuyer", "steelFoundry", "steelSeller"],
    ["oilBuyer", "gasBuyer", "plasticMaker", "plasticSeller", "siliconBuyer", "electronicsMaker", "electronicsSeller"],
    ["explosivesBuyer", "bulletMaker", "gunMaker", "gunSeller"],
    ["aluminiumBuyer", "engineMaker", "engineSeller"],
    ["tankHullMaker", "tankTurretMaker", "tankAssembler", "tankSeller", "dieselRefinery"],
    ["jetFuelRefinery", "rocketHullMaker", "rocketWarheadMaker", "rocketAssembler"],
    ["droneMaker", "droneControlRoom", "droneSeller"],
    ["metalsLab", "gasAndOilLab", "analystCenter", "qualityLab"],
    ["researchCenter", "researchCenter2", "researchCenter3", "researchCenter4"],
  ],

  // Production tree showing input/output relationships
  productionTree: {
    ironFoundry: { ironOre: "ironBuyer" },
    ironSeller: { iron: "ironFoundry" },
    steelFoundry: { iron: "ironFoundry", coal: "coalBuyer" },
    steelSeller: { steel: "steelFoundry" },
    plasticMaker: { oil: "oilBuyer", coal: "coalBuyer", gas: "gasBuyer" },
    plasticSeller: { plastic: "plasticMaker" },
    electronicsMaker: { silicon: "siliconBuyer", plastic: "plasticMaker" },
    electronicsSeller: { electronics: "electronicsMaker" },
    engineMaker: { aluminium: "aluminiumBuyer", steel: "steelFoundry", electronics: "electronicsMaker" },
    engineSeller: { engine: "engineMaker" },
    bulletMaker: { steel: "steelFoundry", explosives: "explosivesBuyer" },
    gunMaker: { steel: "steelFoundry", bullets: "bulletMaker" },
    gunSeller: { guns: "gunMaker" },
    tankHullMaker: { steel: "steelFoundry", aluminium: "aluminiumBuyer", electronics: "electronicsMaker" },
    tankTurretMaker: { steel: "steelFoundry", guns: "gunMaker" },
    tankAssembler: { tankHull: "tankHullMaker", tankTurret: "tankTurretMaker", engine: "engineMaker" },
    tankSeller: { tank: "tankAssembler", diesel: "dieselRefinery", rocket: "rocketAssembler" },
    dieselRefinery: { oil: "oilBuyer" },
    rocketHullMaker: { aluminium: "aluminiumBuyer", engine: "engineMaker" },
    rocketWarheadMaker: { aluminium: "aluminiumBuyer", electronics: "electronicsMaker", explosives: "explosivesBuyer" },
    rocketAssembler: { warhead: "rocketWarheadMaker", rocketHull: "rocketHullMaker", jetFuel: "jetFuelRefinery" },
    droneMaker: { aluminium: "aluminiumBuyer", plastic: "plasticMaker", electronics: "electronicsMaker", engine: "engineMaker", guns: "gunMaker" },
    droneControlRoom: { steel: "steelFoundry", electronics: "electronicsMaker" },
    droneSeller: { drone: "droneMaker", droneControlRoom: "droneControlRoom", jetFuel: "jetFuelRefinery", rocket: "rocketAssembler" },
    jetFuelRefinery: { gas: "gasBuyer" },
  },

  // All component definitions
  components: [
    {
      id: "transportLine",
      idNum: 1,
      name: "Conveyor",
      width: 1,
      height: 1,
      spriteX: 0,
      spriteY: 0,
      iconX: 1,
      iconY: 0,
      drawStrategy: "track",
      buildByDragging: true,
      canBuildToPartial: true,
      runningCostPerTick: 0,
      price: 10,
      priceRefund: 1,
      strategy: { type: "transport", queueSize: 2 },
    },
    {
      id: "garbageCollector",
      idNum: 25,
      name: "Garbage",
      description: "Accepts any item and discards it as garbage.",
      width: 1,
      height: 1,
      spriteX: 3,
      spriteY: 2,
      iconX: 2,
      iconY: 3,
      runningCostPerTick: 0,
      requiresResearch: "metalsLab",
      price: 2500,
      priceRefund: 0.5,
      strategy: { type: "garbage", max: 15, removeAmount: 5, interval: 10 },
    },
    {
      id: "sorterVertical",
      idNum: 36,
      name: "Sorter",
      width: 1,
      height: 3,
      spriteX: 6,
      spriteY: 8,
      iconX: 7,
      iconY: 3,
      runningCostPerTick: 2,
      requiresResearch: "sorter",
      price: 400000,
      priceRefund: 1,
      allowedInputs: { "0:1:left": true, "0:1:right": true },
      allowedOutputs: { "0:0": true, "0:1": true, "0:2": true },
      strategy: { type: "sorter", interval: 1 },
    },
    {
      id: "sorterHorizontal",
      idNum: 37,
      name: "Sorter",
      width: 3,
      height: 1,
      spriteX: 3,
      spriteY: 8,
      iconX: 6,
      iconY: 3,
      runningCostPerTick: 2,
      requiresResearch: "sorter",
      price: 400000,
      priceRefund: 1,
      allowedInputs: { "1:0:top": true, "1:0:bottom": true },
      allowedOutputs: { "0:0": true, "1:0": true, "2:0": true },
      strategy: { type: "sorter", interval: 1 },
    },
    {
      id: "ironBuyer",
      idNum: 2,
      name: "Iron ore buyer",
      width: 2,
      height: 2,
      spriteX: 4,
      spriteY: 0,
      iconX: 2,
      iconY: 0,
      runningCostPerTick: 0,
      price: 50,
      priceRefund: 1,
      strategy: { 
        type: "buyer", 
        purchaseResources: { ironOre: { price: 0, amount: 1 } }, 
        outputResourcesOrder: ["ironOre"], 
        interval: 10 
      },
    },
    {
      id: "ironFoundry",
      idNum: 3,
      name: "Iron foundry",
      width: 4,
      height: 2,
      spriteX: 0,
      spriteY: 0,
      iconX: 3,
      iconY: 0,
      runningCostPerTick: 0,
      price: 150,
      priceRefund: 1,
      requiresResearch: null,
      strategy: { 
        type: "converter", 
        inputResources: { ironOre: { perOutputResource: 2 } }, 
        production: { iron: { amount: 1 } }, 
        outputResourcesOrder: ["iron"], 
        interval: 10 
      },
    },
    {
      id: "ironSeller",
      idNum: 4,
      name: "Iron seller",
      width: 1,
      height: 2,
      spriteX: 6,
      spriteY: 0,
      iconX: 4,
      iconY: 0,
      runningCostPerTick: 0,
      price: 100,
      priceRefund: 1,
      requiresResearch: null,
      strategy: { 
        type: "seller", 
        resources: { iron: { amount: 2, sellPrice: 2.5, sellMargin: 0 } }, 
        interval: 10 
      },
    },
    {
      id: "coalBuyer",
      idNum: 5,
      name: "Coal buyer",
      width: 2,
      height: 1,
      spriteX: 0,
      spriteY: 2,
      iconX: 5,
      iconY: 0,
      runningCostPerTick: 1,
      price: 1000,
      priceRefund: 1,
      requiresResearch: "steelComponents",
      strategy: { 
        type: "buyer", 
        purchaseResources: { coal: { price: 5, amount: 2 } }, 
        outputResourcesOrder: ["coal"], 
        interval: 10 
      },
    },
    {
      id: "steelFoundry",
      idNum: 6,
      name: "Steel foundry",
      width: 3,
      height: 3,
      spriteX: 0,
      spriteY: 3,
      iconX: 6,
      iconY: 0,
      runningCostPerTick: 4,
      price: 4000,
      priceRefund: 1,
      requiresResearch: "steelComponents",
      strategy: { 
        type: "converter", 
        inputResources: { iron: { perOutputResource: 4 }, coal: { perOutputResource: 4 } }, 
        production: { steel: { amount: 1 } }, 
        outputResourcesOrder: ["steel"], 
        interval: 10 
      },
    },
    {
      id: "steelSeller",
      idNum: 7,
      name: "Steel seller",
      width: 2,
      height: 2,
      spriteX: 3,
      spriteY: 3,
      iconX: 7,
      iconY: 0,
      runningCostPerTick: 1,
      price: 1500,
      priceRefund: 1,
      requiresResearch: "steelComponents",
      strategy: { 
        type: "seller", 
        resources: { steel: { amount: 2, sellPrice: 0, sellMargin: 0.6 } }, 
        interval: 10 
      },
    },
    {
      id: "oilBuyer",
      idNum: 8,
      name: "Oil buyer",
      width: 1,
      height: 3,
      spriteX: 0,
      spriteY: 6,
      iconX: 8,
      iconY: 0,
      runningCostPerTick: 8,
      price: 40000,
      priceRefund: 1,
      requiresResearch: "plasticComponents",
      strategy: { 
        type: "buyer", 
        purchaseResources: { oil: { price: 200, amount: 1 } }, 
        outputResourcesOrder: ["oil"], 
        interval: 10 
      },
    },
    {
      id: "gasBuyer",
      idNum: 30,
      name: "Gas buyer",
      width: 2,
      height: 1,
      spriteX: 6,
      spriteY: 15,
      iconX: 0,
      iconY: 3,
      runningCostPerTick: 6,
      price: 60000,
      priceRefund: 1,
      requiresResearch: "plasticComponents",
      strategy: { 
        type: "buyer", 
        purchaseResources: { gas: { price: 80, amount: 1 } }, 
        outputResourcesOrder: ["gas"], 
        interval: 10 
      },
    },
    {
      id: "plasticMaker",
      idNum: 9,
      name: "Plastic maker",
      width: 2,
      height: 3,
      spriteX: 1,
      spriteY: 6,
      iconX: 9,
      iconY: 0,
      runningCostPerTick: 20,
      price: 240000,
      priceRefund: 1,
      requiresResearch: "plasticComponents",
      strategy: {
        type: "converter",
        inputResources: { 
          oil: { perOutputResource: 4 }, 
          coal: { perOutputResource: 4 }, 
          gas: { perOutputResource: 2 } 
        },
        production: { plastic: { amount: 1 }, waste: { amount: 1 } },
        productionRemoveResearch: { waste: "cleanPlastic" },
        outputResourcesOrder: ["plastic", "waste"],
        interval: 10,
      },
    },
    {
      id: "plasticSeller",
      idNum: 10,
      name: "Plastic seller",
      width: 2,
      height: 2,
      spriteX: 3,
      spriteY: 6,
      iconX: 0,
      iconY: 1,
      runningCostPerTick: 12,
      price: 180000,
      priceRefund: 1,
      requiresResearch: "plasticComponents",
      strategy: { 
        type: "seller", 
        resources: { plastic: { amount: 1, sellPrice: 0, sellMargin: 0.6 } }, 
        interval: 10 
      },
    },
    {
      id: "siliconBuyer",
      idNum: 11,
      name: "Silicon buyer",
      width: 1,
      height: 2,
      spriteX: 0,
      spriteY: 9,
      iconX: 1,
      iconY: 1,
      runningCostPerTick: 120,
      price: calculatePrice(50, 2), // 50,000,000
      priceRefund: 1,
      requiresResearch: "electronicsComponents",
      strategy: { 
        type: "buyer", 
        purchaseResources: { silicon: { price: 400, amount: 1 } }, 
        outputResourcesOrder: ["silicon"], 
        interval: 10 
      },
    },
    {
      id: "electronicsMaker",
      idNum: 12,
      name: "Electronics maker",
      width: 2,
      height: 2,
      spriteX: 1,
      spriteY: 9,
      iconX: 2,
      iconY: 1,
      runningCostPerTick: 300,
      price: calculatePrice(200, 2), // 200,000,000
      priceRefund: 1,
      requiresResearch: "electronicsComponents",
      strategy: {
        type: "converter",
        inputResources: { silicon: { perOutputResource: 2 }, plastic: { perOutputResource: 4 } },
        production: { electronics: { amount: 1 }, waste: { amount: 1 } },
        productionRemoveResearch: { waste: "cleanElectronics" },
        outputResourcesOrder: ["electronics", "waste"],
        interval: 10,
      },
    },
    {
      id: "electronicsSeller",
      idNum: 13,
      name: "Electronics seller",
      width: 2,
      height: 2,
      spriteX: 3,
      spriteY: 9,
      iconX: 3,
      iconY: 1,
      runningCostPerTick: 90,
      price: calculatePrice(80, 2), // 80,000,000
      priceRefund: 1,
      requiresResearch: "electronicsComponents",
      strategy: { 
        type: "seller", 
        resources: { electronics: { amount: 1, sellPrice: 0, sellMargin: 2.1 } }, 
        interval: 10 
      },
    },
    {
      id: "explosivesBuyer",
      idNum: 17,
      name: "Explosives buyer",
      width: 2,
      height: 1,
      spriteX: 0,
      spriteY: 13,
      iconX: 7,
      iconY: 1,
      runningCostPerTick: 1900,
      price: calculatePrice(500, 2), // 500,000,000
      priceRefund: 1,
      requiresResearch: "gunComponents",
      strategy: { 
        type: "buyer", 
        purchaseResources: { explosives: { price: 900, amount: 1 } }, 
        outputResourcesOrder: ["explosives"], 
        interval: 20 
      },
    },
    {
      id: "bulletMaker",
      idNum: 18,
      name: "Bullet maker",
      width: 1,
      height: 1,
      spriteX: 2,
      spriteY: 2,
      iconX: 8,
      iconY: 1,
      runningCostPerTick: 3900,
      price: calculatePrice(800, 2), // 800,000,000
      priceRefund: 1,
      requiresResearch: "gunComponents",
      strategy: { 
        type: "converter", 
        inputResources: { steel: { perOutputResource: 3 }, explosives: { perOutputResource: 2 } }, 
        production: { bullets: { amount: 2 } }, 
        outputResourcesOrder: ["bullets"], 
        interval: 20 
      },
    },
    {
      id: "gunMaker",
      idNum: 19,
      name: "Gun maker",
      width: 3,
      height: 2,
      spriteX: 0,
      spriteY: 14,
      iconX: 9,
      iconY: 1,
      runningCostPerTick: 5900,
      price: calculatePrice(1, 3), // 1,000,000,000
      priceRefund: 1,
      requiresResearch: "gunComponents",
      strategy: { 
        type: "converter", 
        inputResources: { steel: { perOutputResource: 3 }, bullets: { perOutputResource: 2 } }, 
        production: { guns: { amount: 2 } }, 
        outputResourcesOrder: ["guns"], 
        interval: 20 
      },
    },
    {
      id: "gunSeller",
      idNum: 20,
      name: "Gun seller",
      width: 2,
      height: 2,
      spriteX: 3,
      spriteY: 14,
      iconX: 0,
      iconY: 2,
      runningCostPerTick: 1100,
      price: calculatePrice(400, 2), // 400,000,000
      priceRefund: 1,
      requiresResearch: "gunComponents",
      strategy: { 
        type: "seller", 
        resources: { guns: { amount: 2, sellPrice: 0, sellMargin: 2.1 } }, 
        interval: 20 
      },
    },
    {
      id: "aluminiumBuyer",
      idNum: 14,
      name: "Aluminium buyer",
      width: 2,
      height: 2,
      spriteX: 0,
      spriteY: 11,
      iconX: 4,
      iconY: 1,
      runningCostPerTick: 48000,
      price: calculatePrice(3, 3), // 3,000,000,000
      priceRefund: 1,
      requiresResearch: "engineComponents",
      strategy: { 
        type: "buyer", 
        purchaseResources: { aluminium: { price: 1400, amount: 1 } }, 
        outputResourcesOrder: ["aluminium"], 
        interval: 10 
      },
    },
    {
      id: "engineMaker",
      idNum: 15,
      name: "Engine maker",
      width: 4,
      height: 3,
      spriteX: 2,
      spriteY: 11,
      iconX: 5,
      iconY: 1,
      runningCostPerTick: 120000,
      price: calculatePrice(32, 3), // 32,000,000,000
      priceRefund: 1,
      requiresResearch: "engineComponents",
      strategy: {
        type: "converter",
        inputResources: { 
          aluminium: { perOutputResource: 4 }, 
          steel: { perOutputResource: 6 }, 
          electronics: { perOutputResource: 3 } 
        },
        production: { engine: { amount: 1 }, waste: { amount: 1 } },
        productionRemoveResearch: { waste: "cleanEngines" },
        outputResourcesOrder: ["engine", "waste"],
        interval: 10,
      },
    },
    {
      id: "engineSeller",
      idNum: 16,
      name: "Engine seller",
      width: 2,
      height: 2,
      spriteX: 6,
      spriteY: 11,
      iconX: 6,
      iconY: 1,
      runningCostPerTick: 80000,
      price: calculatePrice(8, 3), // 8,000,000,000
      priceRefund: 1,
      requiresResearch: "engineComponents",
      strategy: { 
        type: "seller", 
        resources: { engine: { amount: 1, sellPrice: 0, sellMargin: 2.1 } }, 
        interval: 10 
      },
    },
    {
      id: "tankHullMaker",
      idNum: 21,
      name: "Tank hull maker",
      width: 5,
      height: 3,
      spriteX: 0,
      spriteY: 16,
      iconX: 1,
      iconY: 2,
      runningCostPerTick: 1600000,
      price: calculatePrice(400, 3), // 400,000,000,000
      priceRefund: 1,
      requiresResearch: "tankComponents",
      strategy: {
        type: "converter",
        inputResources: { 
          electronics: { perOutputResource: 3 }, 
          steel: { perOutputResource: 6 }, 
          aluminium: { perOutputResource: 2 } 
        },
        production: { tankHull: { amount: 1 } },
        outputResourcesOrder: ["tankHull"],
        interval: 10,
      },
    },
    {
      id: "tankTurretMaker",
      idNum: 22,
      name: "Tank turret maker",
      width: 3,
      height: 2,
      spriteX: 5,
      spriteY: 16,
      iconX: 2,
      iconY: 2,
      runningCostPerTick: 2000000,
      price: calculatePrice(800, 3), // 800,000,000,000
      priceRefund: 1,
      requiresResearch: "tankComponents",
      strategy: { 
        type: "converter", 
        inputResources: { guns: { perOutputResource: 4 }, steel: { perOutputResource: 6 } }, 
        production: { tankTurret: { amount: 1 } }, 
        outputResourcesOrder: ["tankTurret"], 
        interval: 10 
      },
    },
    {
      id: "tankAssembler",
      idNum: 23,
      name: "Tank assembly",
      width: 2,
      height: 4,
      spriteX: 8,
      spriteY: 16,
      iconX: 3,
      iconY: 2,
      runningCostPerTick: 1800000,
      price: calculatePrice(700, 3), // 700,000,000,000
      priceRefund: 1,
      requiresResearch: "tankComponents",
      strategy: {
        type: "converter",
        inputResources: { 
          tankHull: { perOutputResource: 1 }, 
          tankTurret: { perOutputResource: 1 }, 
          engine: { perOutputResource: 1 } 
        },
        production: { tank: { amount: 1 } },
        outputResourcesOrder: ["tank"],
        interval: 10,
      },
    },
    {
      id: "tankSeller",
      idNum: 26,
      name: "Tank seller",
      width: 2,
      height: 2,
      spriteX: 5,
      spriteY: 18,
      iconX: 4,
      iconY: 2,
      runningCostPerTick: 2400000,
      price: calculatePrice(500, 3), // 500,000,000,000
      priceRefund: 1,
      requiresResearch: "tankComponents",
      strategy: {
        type: "seller",
        resources: {
          tank: { amount: 1, sellPrice: 0, sellMargin: 2.1 },
          diesel: { amount: 8, sellPrice: 0, sellMargin: 2.6, bonus: true, requiresResearch: "dieselRefinery" },
          rocket: { amount: 1, sellPrice: 0, sellMargin: 2.6, bonus: true, requiresResearch: "rocketComponents" },
        },
        interval: 10,
      },
    },
    {
      id: "dieselRefinery",
      idNum: 32,
      name: "Diesel refinery",
      width: 3,
      height: 2,
      spriteX: 5,
      spriteY: 6,
      iconX: 5,
      iconY: 2,
      runningCostPerTick: 18000000,
      price: calculatePrice(15, 4), // 15,000,000,000,000
      priceRefund: 1,
      requiresResearch: "dieselRefinery",
      strategy: {
        type: "converter",
        inputResources: { oil: { perOutputResource: 96 } },
        production: { diesel: { amount: 16 }, waste: { amount: 8 } },
        outputResourcesOrder: ["diesel", "diesel", "waste"],
        interval: 10,
      },
    },
    {
      id: "jetFuelRefinery",
      idNum: 31,
      name: "Jet fuel refinery",
      width: 2,
      height: 2,
      spriteX: 6,
      spriteY: 13,
      iconX: 1,
      iconY: 3,
      runningCostPerTick: 100000000,
      price: calculatePrice(35, 4), // 35,000,000,000,000
      priceRefund: 1,
      requiresResearch: "rocketComponents",
      strategy: {
        type: "converter",
        inputResources: { gas: { perOutputResource: 24 } },
        production: { jetFuel: { amount: 8 }, waste: { amount: 4 } },
        outputResourcesOrder: ["jetFuel", "jetFuel", "waste"],
        interval: 10,
      },
    },
    {
      id: "rocketHullMaker",
      idNum: 27,
      name: "Rocket hull maker",
      width: 3,
      height: 2,
      spriteX: 0,
      spriteY: 19,
      iconX: 6,
      iconY: 2,
      runningCostPerTick: 15000000,
      price: calculatePrice(60, 4), // 60,000,000,000,000
      priceRefund: 1,
      requiresResearch: "rocketComponents",
      strategy: { 
        type: "converter", 
        inputResources: { aluminium: { perOutputResource: 8 }, engine: { perOutputResource: 1 } }, 
        production: { rocketHull: { amount: 1, max: 3 } }, 
        outputResourcesOrder: ["rocketHull"], 
        interval: 10 
      },
    },
    {
      id: "rocketWarheadMaker",
      idNum: 28,
      name: "Warhead maker",
      width: 2,
      height: 3,
      spriteX: 3,
      spriteY: 19,
      iconX: 7,
      iconY: 2,
      runningCostPerTick: 12000000,
      price: calculatePrice(130, 4), // 130,000,000,000,000
      priceRefund: 1,
      requiresResearch: "rocketComponents",
      strategy: { 
        type: "converter", 
        inputResources: { 
          aluminium: { perOutputResource: 4 }, 
          electronics: { perOutputResource: 3 }, 
          explosives: { perOutputResource: 8 } 
        }, 
        production: { warhead: { amount: 1 } }, 
        outputResourcesOrder: ["warhead"], 
        interval: 10 
      },
    },
    {
      id: "rocketAssembler",
      idNum: 29,
      name: "Rocket assembly",
      width: 2,
      height: 2,
      spriteX: 5,
      spriteY: 20,
      iconX: 8,
      iconY: 2,
      runningCostPerTick: 19000000,
      price: calculatePrice(110, 4), // 110,000,000,000,000
      priceRefund: 1,
      requiresResearch: "rocketComponents",
      strategy: { 
        type: "converter", 
        inputResources: { 
          rocketHull: { perOutputResource: 2 }, 
          warhead: { perOutputResource: 2 }, 
          jetFuel: { perOutputResource: 8 } 
        }, 
        production: { rocket: { amount: 2 } }, 
        outputResourcesOrder: ["rocket"], 
        interval: 10 
      },
    },
    {
      id: "droneMaker",
      idNum: 41,
      name: "Drone maker",
      width: 2,
      height: 6,
      spriteX: 8,
      spriteY: 9,
      iconX: 5,
      iconY: 4,
      runningCostPerTick: 1000000000,
      price: calculatePrice(6, 5), // 6,000,000,000,000,000
      priceRefund: 1,
      requiresResearch: "droneComponents",
      strategy: {
        type: "converter",
        inputResources: { 
          aluminium: { perOutputResource: 64 }, 
          plastic: { perOutputResource: 48 }, 
          electronics: { perOutputResource: 24 }, 
          engine: { perOutputResource: 8 }, 
          guns: { perOutputResource: 32 } 
        },
        production: { drone: { amount: 8 } },
        outputResourcesOrder: ["drone"],
        interval: 20,
      },
    },
    {
      id: "droneControlRoom",
      idNum: 42,
      name: "Drone control room",
      width: 3,
      height: 5,
      spriteX: 10,
      spriteY: 11,
      iconX: 6,
      iconY: 4,
      runningCostPerTick: 150000000,
      price: calculatePrice(6, 5), // 6,000,000,000,000,000
      priceRefund: 1,
      requiresResearch: "droneComponents",
      strategy: { 
        type: "converter", 
        inputResources: { steel: { perOutputResource: 96 }, electronics: { perOutputResource: 24 } }, 
        production: { droneControlRoom: { amount: 4 } }, 
        outputResourcesOrder: ["droneControlRoom"], 
        interval: 20 
      },
    },
    {
      id: "droneSeller",
      idNum: 43,
      name: "Drone seller",
      width: 2,
      height: 2,
      spriteX: 10,
      spriteY: 16,
      iconX: 7,
      iconY: 4,
      runningCostPerTick: 3000000000,
      price: calculatePrice(4, 5), // 4,000,000,000,000,000
      priceRefund: 1,
      requiresResearch: "droneComponents",
      strategy: {
        type: "seller",
        resources: {
          drone: { amount: 4, sellPrice: 0, sellMargin: 1.9 },
          droneControlRoom: { amount: 2, sellPrice: 0, sellMargin: 1.9 },
          rocket: { amount: 8, sellPrice: 0, bonus: true, sellMargin: 6 },
          jetFuel: { amount: 32, sellPrice: 0, bonus: true, sellMargin: 3 },
        },
        interval: 20,
      },
    },
    {
      id: "researchCenter",
      idNum: 33,
      name: "Research center",
      width: 4,
      height: 4,
      spriteX: 5,
      spriteY: 2,
      iconX: 3,
      iconY: 3,
      runningCostPerTick: 4,
      price: 1000,
      priceRefund: 1,
      requiresResearch: "researchCenter",
      strategy: { 
        type: "researchCenter", 
        researchProduction: 1, 
        resources: { report1: { max: 4, bonus: 2 } }, 
        interval: 10 
      },
    },
    {
      id: "metalsLab",
      idNum: 34,
      name: "Metals lab",
      width: 3,
      height: 2,
      spriteX: 7,
      spriteY: 0,
      iconX: 5,
      iconY: 3,
      runningCostPerTick: 8,
      price: 40000,
      priceRefund: 1,
      requiresResearch: "metalsLab",
      strategy: {
        type: "lab",
        inputResources: { 
          iron: { perOutputResource: 1, max: 25, bonus: 4 }, 
          steel: { perOutputResource: 1, max: 25, bonus: 6 }, 
          aluminium: { perOutputResource: 1, max: 25, bonus: 5 } 
        },
        production: { report1: { amount: 1, max: 25 } },
        outputResourcesOrder: ["report1"],
        interval: 20,
      },
    },
    {
      id: "gasAndOilLab",
      idNum: 35,
      name: "Gas&Oil lab",
      width: 2,
      height: 3,
      spriteX: 8,
      spriteY: 6,
      iconX: 4,
      iconY: 3,
      runningCostPerTick: 200,
      price: 600000,
      priceRefund: 1,
      requiresResearch: "gasAndOilLab",
      strategy: {
        type: "lab",
        inputResources: {
          gas: { perOutputResource: 1, max: 25, bonus: 2 },
          oil: { perOutputResource: 1, max: 25, bonus: 3 },
          plastic: { perOutputResource: 1, max: 25, bonus: 10 },
          diesel: { perOutputResource: 1, max: 3, bonus: 8 },
          jetFuel: { perOutputResource: 1, max: 3, bonus: 8 },
        },
        production: { report2: { amount: 1, max: 25 } },
        outputResourcesOrder: ["report2"],
        interval: 20,
      },
    },
    {
      id: "researchCenter2",
      idNum: 38,
      name: "Research center 2",
      width: 4,
      height: 4,
      spriteX: 10,
      spriteY: 0,
      iconX: 2,
      iconY: 4,
      runningCostPerTick: 200,
      price: 600000,
      priceRefund: 1,
      requiresResearch: "gasAndOilLab",
      applyUpgradesFrom: "researchCenter",
      strategy: { 
        type: "researchCenter", 
        researchProduction: 4, 
        resources: { report2: { max: 4, bonus: 3 } }, 
        interval: 20 
      },
    },
    {
      id: "analystCenter",
      idNum: 39,
      name: "Analytics center",
      width: 3,
      height: 3,
      spriteX: 10,
      spriteY: 8,
      iconX: 4,
      iconY: 4,
      runningCostPerTick: 12000,
      price: 2000000,
      priceRefund: 1,
      requiresResearch: "analystCenter",
      strategy: {
        type: "converter",
        inputResources: { 
          report1: { perOutputResource: 32, max: 256, bonus: 10 }, 
          report2: { perOutputResource: 32, max: 256, bonus: 10 } 
        },
        production: { report3: { amount: 20, max: 100 }, waste: { amount: 20, max: 100 } },
        outputResourcesOrder: ["report3", "waste"],
        interval: 40,
      },
    },
    {
      id: "researchCenter3",
      idNum: 40,
      name: "Research center 3",
      width: 4,
      height: 4,
      spriteX: 10,
      spriteY: 4,
      iconX: 3,
      iconY: 4,
      runningCostPerTick: 35000,
      price: 6000000,
      priceRefund: 1,
      requiresResearch: "analystCenter",
      applyUpgradesFrom: "researchCenter",
      strategy: { 
        type: "researchCenter", 
        researchProduction: 20, 
        resources: { report3: { max: 4, bonus: 16 } }, 
        interval: 40 
      },
    },
    {
      id: "qualityLab",
      idNum: 44,
      name: "Quality lab",
      width: 4,
      height: 2,
      spriteX: 12,
      spriteY: 16,
      iconX: 0,
      iconY: 4,
      runningCostPerTick: 400000,
      price: calculatePrice(3, 5), // 3,000,000,000,000,000
      priceRefund: 1,
      requiresResearch: "qualityCenter",
      strategy: {
        type: "lab",
        inputResources: {
          tank: { perOutputResource: 1, max: 25, bonus: 21 },
          rocket: { perOutputResource: 1, max: 25, bonus: 16 },
          engine: { perOutputResource: 1, max: 25, bonus: 10 },
          guns: { perOutputResource: 1, max: 3, bonus: 6 },
          drone: { perOutputResource: 1, max: 3, bonus: 24 },
        },
        production: { report4: { amount: 1, max: 1000 } },
        outputResourcesOrder: ["report4"],
        interval: 5,
      },
    },
    {
      id: "researchCenter4",
      idNum: 45,
      name: "Research center 4",
      width: 4,
      height: 4,
      spriteX: 10,
      spriteY: 18,
      iconX: 1,
      iconY: 4,
      runningCostPerTick: 500000,
      price: calculatePrice(2, 5), // 2,000,000,000,000,000
      priceRefund: 1,
      requiresResearch: "qualityCenter",
      applyUpgradesFrom: "researchCenter",
      strategy: { 
        type: "researchCenter", 
        researchProduction: 100, 
        resources: { report4: { max: 64, bonus: 100 } }, 
        interval: 40 
      },
    },
  ],
};

// Helper functions to get component information
export function getComponentById(componentId) {
  return components.components.find(component => component.id === componentId);
}

export function getComponentPrice(componentId) {
  const component = getComponentById(componentId);
  return component ? component.price : null;
}

export function getAllComponents() {
  return components.components;
}

export function getComponentsByType(type) {
  return components.components.filter(component => component.strategy.type === type);
}

export function getComponentsByResearch(researchId) {
  return components.components.filter(component => component.requiresResearch === researchId);
}

export function getProductionTree() {
  return components.productionTree;
}

export function getComponentSelection() {
  return components.selection;
}

export function getBuyerComponents() {
  return getComponentsByType('buyer');
}

export function getSellerComponents() {
  return getComponentsByType('seller');
}

export function getConverterComponents() {
  return getComponentsByType('converter');
}

export function getTransportComponents() {
  return getComponentsByType('transport');
}

export function getLabComponents() {
  return getComponentsByType('lab');
}

export function getResearchCenterComponents() {
  return getComponentsByType('researchCenter');
}

export default components;
