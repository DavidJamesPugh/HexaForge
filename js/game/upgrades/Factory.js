import BuyerUpgrade from "./strategy/BuyerUpgrade.js";
import ConverterUpgrade from "./strategy/ConverterUpgrade.js";
import ConverterProduceMoreUpgrade from "./strategy/ConverterProduceMoreUpgrade.js";
import GarbageUpgrade from "./strategy/GarbageUpgrade.js";
import PackageSize from "./strategy/PackageSize.js";
import ResearchCenterBonusUpgrade from "./strategy/ResearchCenterBonusUpgrade.js";
import ResearchCenterMaxStock from "./strategy/ResearchCenterMaxStock.js";
import RunningCostUpgrade from "./strategy/RunningCostUpgrade.js";
import SellerSellAmountUpgrade from "./strategy/SellerSellAmountUpgrade.js";
import SellerSellPriceUpgrade from "./strategy/SellerSellPriceUpgrade.js";

const strategies = {
  buyer: BuyerUpgrade,
  converter: ConverterUpgrade,
  converterProduceMore: ConverterProduceMoreUpgrade,
  garbage: GarbageUpgrade,
  packageSize: PackageSize,
  researchCenterBonus: ResearchCenterBonusUpgrade,
  researchCenterMaxStock: ResearchCenterMaxStock,
  runningCost: RunningCostUpgrade,
  sellerSellAmount: SellerSellAmountUpgrade,
  sellerSellPrice: SellerSellPriceUpgrade,
};

export default {
  getStrategyClass(type) {
    const strategy = strategies[type];
    if (!strategy) throw new Error(`Unknown component strategy ${type}`);
    return strategy;
  },
  getStrategy(meta, level, factory) {
    const StrategyClass = this.getStrategyClass(meta.type);
    return new StrategyClass(meta, level, factory);
  },
};
