// Products configuration extracted from app.js
const products = {
  timeTravelTicketValue: 3,
  layout: {
    specials: ["researchproduction", "researchproduction2", "extraticks", "extraprofit"],
    bonusTicks: ["bonusticks1", "bonusticks2", "bonusticks3", "bonusticks4", "bonusticks5"],
    timeTravelTickets: ["timetravel1", "timetravel2", "timetravel3", "timetravel4", "timetravel5"],
  },
  items: [
    {
      id: "bonusticks1",
      idNum: 1,
      name: "80 000 bonus ticks",
      description: "Getting there faster",
      consumable: true,
      strategy: { type: "bonusTicks", amount: 80000 },
      priceStr: { local: "1u", web: "$2.99", kongregate: "25 Kreds" },
      price: 2.99
    },
    { 
      id: "bonusticks2", 
      idNum: 2, 
      name: "240 000 bonus ticks", 
      description: "+50% more", 
      consumable: true, 
      strategy: { type: "bonusTicks", amount: 240000 }, 
      priceStr: { local: "2u", web: "$5.99", kongregate: "50 Kreds" },
      price: 5.99
    },
    { 
      id: "bonusticks3", 
      idNum: 3, 
      name: "800 000 bonus ticks", 
      description: "+200% more", 
      consumable: true, 
      strategy: { type: "bonusTicks", amount: 800000 }, 
      priceStr: { local: "3u", web: "$9.99", kongregate: "110 Kreds" },
      price: 9.99
    },
    {
      id: "bonusticks4",
      idNum: 4,
      name: "2 400 000 bonus ticks",
      description: "+350% more",
      consumable: true,
      strategy: { type: "bonusTicks", amount: 2400000 },
      priceStr: { local: "4u", web: "$19.99", kongregate: "225 Kreds" },
      price: 19.99
    },
    {
      id: "bonusticks5",
      idNum: 5,
      name: "12 000 000 bonus ticks",
      description: "+650% more",
      consumable: true,
      strategy: { type: "bonusTicks", amount: 12000000 },
      priceStr: { local: "5u", web: "$59.99", kongregate: "565 Kreds" },
      price: 59.99
    },
    {
      id: "bonusticks6",
      idNum: 6,
      name: "40 000 000 bonus ticks",
      description: "+1145% more",
      consumable: true,
      strategy: { type: "bonusTicks", amount: 40000000 },
      priceStr: { local: "6u", web: "$119.99", kongregate: "1150 Kreds" },
      price: 119.99
    },
    { 
      id: "timetravel1", 
      idNum: 7, 
      name: "1 ticket (3h)", 
      description: "Wow, really?", 
      consumable: true, 
      strategy: { type: "timeTravelTickets", amount: 1 }, 
      priceStr: { local: "1u", web: "$2.99", kongregate: "25 Kreds" },
      price: 2.99
    },
    {
      id: "timetravel2",
      idNum: 8,
      name: "3 tickets  (3x3h)",
      description: "50% cheaper!",
      consumable: true,
      strategy: { type: "timeTravelTickets", amount: 3 },
      priceStr: { local: "2u", web: "$5.99", kongregate: "50 Kreds" },
      price: 5.99
    },
    {
      id: "timetravel3",
      idNum: 9,
      name: "8 tickets  (8x3h)",
      description: "140% cheaper!",
      consumable: true,
      strategy: { type: "timeTravelTickets", amount: 8 },
      priceStr: { local: "3u", web: "$9.99", kongregate: "110 Kreds" },
      price: 9.99
    },
    {
      id: "timetravel4",
      idNum: 10,
      name: "25 tickets (25x3h)",
      description: "270% cheaper!",
      consumable: true,
      strategy: { type: "timeTravelTickets", amount: 25 },
      priceStr: { local: "4u", web: "$19.99", kongregate: "225 Kreds" },
      price: 19.99
    },
    {
      id: "timetravel5",
      idNum: 11,
      name: "100 tickets (100x3h)",
      description: "400% cheaper!",
      consumable: true,
      strategy: { type: "timeTravelTickets", amount: 100 },
      priceStr: { local: "5u", web: "$59.99", kongregate: "565 Kreds" },
      price: 59.99
    },
    {
      id: "timetravel6",
      idNum: 12,
      name: "300 tickets (300x3h)",
      description: "650% cheaper!",
      consumable: true,
      strategy: { type: "timeTravelTickets", amount: 300 },
      priceStr: { local: "6u", web: "$119.99", kongregate: "1150 Kreds" },
      price: 119.99
    },
    {
      id: "researchproduction",
      idNum: 13,
      name: "Evolved brain",
      description: "3x research points production",
      consumable: false,
      strategy: { type: "researchProductionBonus", bonus: 3 },
      priceStr: { local: "6u", web: "$9.99", kongregate: "110 Kreds" },
      price: 9.99
    },
    {
      id: "researchproduction2",
      idNum: 14,
      name: "Alien brain",
      description: "4x research points production",
      consumable: false,
      requiresProduct: "researchproduction",
      strategy: { type: "researchProductionBonus", bonus: 4 },
      priceStr: { local: "6u", web: "$9.99", kongregate: "110 Kreds" },
      price: 9.99
    },
    {
      id: "extraticks",
      idNum: 15,
      name: "Chronobooster",
      description: "+8 extra ticks per second",
      consumable: false,
      strategy: { type: "extraTicks", bonus: 8 },
      priceStr: { local: "7u", web: "$19.99", kongregate: "225 Kreds" },
      price: 19.99
    },
    {
      id: "extraprofit",
      idNum: 16,
      name: "Tax evasion",
      description: "3x profit!",
      consumable: false,
      requiresProduct: "extraticks",
      strategy: { type: "extraProfit", bonus: 3 },
      priceStr: { local: "6u", web: "$19.99", kongregate: "225 Kreds" },
      price: 19.99
    },
    {
      id: "starter1",
      idNum: 18,
      name: "Starter pack",
      description: "8 time travel tickets + 300 000 bonus ticks",
      consumable: true,
      special: true,
      strategy: { type: "starter", timeTravelTickets: 8, bonusTicks: 300000 },
      priceStr: { local: "3u", web: "$9.99", kongregate: "110 Kreds" },
      price: 9.99
    },
    {
      id: "starter2",
      idNum: 17,
      name: "Fun pack",
      description: "3 time travel tickets + 60 000 bonus ticks",
      consumable: true,
      special: true,
      strategy: { type: "starter", timeTravelTickets: 3, bonusTicks: 60000 },
      priceStr: { local: "2u", web: "$5.99", kongregate: "50 Kreds" },
      price: 5.99
    },
  ],
};

// Helper functions to get product information
export function getProductById(productId) {
  return products.items.find(item => item.id === productId);
}

export function getProductPrice(productId) {
  const product = getProductById(productId);
  return product ? product.price : null;
}

export function getProductPriceString(productId, platform = 'web') {
  const product = getProductById(productId);
  return product ? product.priceStr[platform] : null;
}

export function getAllProducts() {
  return products.items;
}

export function getProductsByType(type) {
  return products.items.filter(item => {
    if (type === 'bonusTicks') return item.strategy.type === 'bonusTicks';
    if (type === 'timeTravelTickets') return item.strategy.type === 'timeTravelTickets';
    if (type === 'specials') return products.layout.specials.includes(item.id);
    return false;
  });
}

export default products;
