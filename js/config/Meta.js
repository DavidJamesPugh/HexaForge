// Meta.js
import productsModule from "./products.js";
import mainModule from "./main/main.js";
import Ruleset from "./Ruleset.js";

const meta = {
  main: Ruleset.prepareMeta(mainModule),
  productsLayout: productsModule.layout,
  products: productsModule.items,
  timeTravelTicketValue: productsModule.timeTravelTicketValue,
};

// Build product lookup tables
meta.productsById = {};
meta.productsByIdNum = [];

for (const product of meta.products) {
  if (meta.productsById[product.id]) {
    throw new Error(`Purchase with id ${product.id} already exists!`);
  }
  if (meta.productsByIdNum[product.idNum]) {
    throw new Error(`Purchase with idNum ${product.idNum} already exists!`);
  }
  meta.productsById[product.id] = product;
  meta.productsByIdNum[product.idNum] = product;
}

export default meta;
