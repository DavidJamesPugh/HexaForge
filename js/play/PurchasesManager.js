import logger from "../base/Logger.js";

export default class PurchasesManager {
  constructor(play) {
    this.play = play;
    this.game = play.getGame();
    this.unlocks = {};

    this.strategies = {
      bonusTicks: {
        apply: ({ amount }) => {
          this.game.getTicker().addBonusTicks(amount);
          this.game.setIsPremium(true);
          logger.info("PurchasesManager", `Added ${amount} bonus ticks`);
        },
      },
      timeTravelTickets: {
        apply: ({ amount }) => {
          this.game.getTicker().addTimeTravelTickets(amount);
          this.game.setIsPremium(true);
          logger.info("PurchasesManager", `Added ${amount} time travel tickets`);
        },
      },
      researchProductionBonus: {
        apply: ({ bonus }) => {
          this.game.setResearchProductionMultiplier(this.game.getResearchProductionMultiplier() * bonus);
          this.game.setIsPremium(true);
          logger.info("PurchasesManager", "Set research production bonus");
        },
      },
      extraTicks: {
        apply: ({ bonus }) => {
          this.game.getTicker().setPurchaseBonusTicks(bonus);
          this.game.setIsPremium(true);
          logger.info("PurchasesManager", "Set extra ticks");
        },
      },
      extraProfit: {
        apply: ({ bonus }) => {
          this.game.setProfitMultiplier(bonus);
          this.game.setIsPremium(true);
          logger.info("PurchasesManager", "Set extra profit");
        },
      },
    };
  }

  isVisible(productId) {
    const product = this.play.getMeta().productsById[productId];
    if (!product) return false;
    return !(product.requiresProduct && !this.getIsUnlocked(product.requiresProduct)) && !product.special;
  }

  getPriceKey() {
    return this.play.getApi().getKey();
  }

  init(callback = () => {}) {
    this.loadPurchases(callback);
  }

  loadPurchases(callback = () => {}) {
    this.play.getApi().loadPurchases((purchases) => {
      logger.info("PurchasesManager", "Purchases loaded", purchases);
      this.handlePurchases(purchases);
      callback();
    });
  }

  startPurchase(productId, callback = () => {}) {
    this.play.getApi().purchase(productId, () => {
      this.loadPurchases(callback);
    });
  }

  destroy() {
    // no-op for now
  }

  handlePurchases(purchases) {
    this.game.setResearchProductionMultiplier(1);
    this.game.getTicker().setPurchaseBonusTicks(0);
    this.game.setProfitMultiplier(1);

    purchases.forEach(this.handlePurchase.bind(this));
  }

  handlePurchase(purchase) {
    const product = this.play.getMeta().productsById[purchase.productId];
    if (!product) {
      logger.warning("PurchasesManager", `Unknown product with id ${purchase.productId}`, purchase);
      return;
    }

    const strategy = this.strategies[product.strategy.type];
    if (strategy) {
      strategy.apply(product.strategy);
      logger.info("PurchasesManager", `Applied consumable strategy ${product.strategy.type} for purchase ${purchase.productId}`);

      if (product.consumable) {
        this.play.getSaveManager().saveAuto(() => {
          this.play.getApi().setConsumed(purchase.externalId, () => {
            logger.info("PurchasesManager", `Purchase ${purchase.externalId} set to consumed`);
          });
        });
      } else {
        this.unlocks[purchase.productId] = true;
        logger.info("PurchasesManager", `Purchase unlocked ${purchase.productId} with external id ${purchase.externalId}`);
      }
    } else {
      logger.error(
        "PurchasesManager",
        `Invalid consumable strategy ${product.strategy.type} for purchase ${purchase.productId}. Could not handle purchase.`
      );
    }
  }

  getIsUnlocked(productId) {
    return !!this.unlocks[productId];
  }
}
