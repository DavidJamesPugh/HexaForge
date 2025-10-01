// src/ui/UpgradesUi.js
import Handlebars from "handlebars";
import template from "/js/template/upgrades.html?raw";
import BuyUpgrade from "/js/game/action/BuyUpgrade.js";
import SellUpgrade from "/js/game/action/SellUpgrade.js";
import TipUi from "/js/ui/helper/TipUi.js";
import GameContext from "../base/GameContext.js";
import GameUiEvent from "../config/event/GameUiEvent.js";
import GameEvent from "../config/event/GameEvent.js";
import numberFormat from "../base/NumberFormat.js";
import FactoryEvent from "../config/event/FactoryEvent.js";

export default class UpgradesUi {
  constructor(factory) {
    this.gameUiEm = GameContext.gameUiBus;
    this.factory = factory;
    this.game = factory.getGame();
    this.container = null;
  }

  display(container) {
    this.container = container;
    const upgradesManager = this.factory.getUpgradesManager();
    const groups = [];

    for (const groupMeta of this.game.getMeta().upgradesLayout) {
      if (groupMeta.type === "break") {
        groups.push({ isBreak: true });
        continue;
      }

      const upgrades = [];
      for (const id of groupMeta.items) {
        if (id === "_") continue;

        const upgradeMeta = this.game.getMeta().upgradesById[id];
        if (!upgradeMeta) {
          console.error(`Group item with id ${id} not found!`);
          continue;
        }

        if (!upgradesManager.isVisible(upgradeMeta.id)) continue;

        const strategy = upgradesManager.getStrategy(upgradeMeta.id);

        if (upgradeMeta.refund) {
          upgrades.push({
            id: upgradeMeta.id,
            action: "sell",
            isSell: true,
            canSell: upgradesManager.canSell(upgradeMeta.id),
            sellPrice: numberFormat.formatNumber(
              upgradesManager.getSellPrice(upgradeMeta.id)
            ),
            refund: `${100 * upgradeMeta.refund}%`,
            title: strategy.getTitle(),
            description: strategy.getDescription(),
            iconStyle: `background-position: -${26 * upgradeMeta.iconX}px -${
              26 * upgradeMeta.iconY
            }px`,
          });
        }

        upgrades.push({
          id: upgradeMeta.id,
          action: "buy",
          isBuy: true,
          isMaxed: !upgradesManager.couldPurchase(upgradeMeta.id),
          buyPrice: numberFormat.formatNumber(
            upgradesManager.getPrice(upgradeMeta.id)
          ),
          title: strategy.getTitle(),
          description: strategy.getDescription(),
          iconStyle: `background-position: -${26 * upgradeMeta.iconX}px -${
            26 * upgradeMeta.iconY
          }px`,
        });
      }
      if (upgrades.length > 0) {
        upgrades.reverse();
        groups.push({
          name: groupMeta.name,
          upgrades,
          iconStyle: `background-position: -${26 * groupMeta.iconX}px -${
            26 * groupMeta.iconY
          }px`,
        });
      }
    }
    
    // Render into container
    this.container.innerHTML = Handlebars.compile(template)({ groups });

    // Back button
    const backBtn = this.container.querySelector(".backButton");
    if (backBtn) {
      backBtn.addEventListener("pointerdown", () => {
        this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY);
      });
    }

    // Upgrade click handling
    this.tooltipDestroyers = [];

    this.container.querySelectorAll(".upgradeItem").forEach((el) => {
      const id = el.dataset.id;
      const actionType = el.dataset.action;

      const tip = new TipUi(el, el.querySelector(".upgradePopup")).init();
      this.tooltipDestroyers.push(() => tip.destroy());

      el.addEventListener("pointerdown", () => {
        if (actionType === "sell") {
          const action = new SellUpgrade(this.factory, id);
          if (action.canSell()) action.sell();
        } else if (actionType === "buy") {
          const action = new BuyUpgrade(this.factory, id);
          if (action.canBuy()) action.buy();
        }
        this.refreshView();
      });
    });

    this.game
      .getEventManager()
      .addListener("upgradeUi", GameEvent.GAME_TICK, () => this.update());
    this.factory
      .getEventManager()
      .addListener("upgradeUi", FactoryEvent.UPGRADES_UPDATED, (id) => this.handleUpgradesUpdated(id));
    this.update();
  }

  refreshView() {
    const currentContainer = this.container;
    this.destroy(false);
    this.display(currentContainer);
  }

  handleUpgradesUpdated(upgradeId) {
    this.refreshUpgrade(upgradeId);
  }

  refreshUpgrade(upgradeId) {
    this.updateUpgradeItem(upgradeId, "buy");
    this.updateUpgradeItem(upgradeId, "sell");
  }

  updateUpgradeItem(upgradeId, action) {
    const item = this.container.querySelector(`.upgradeItem[data-id="${upgradeId}"][data-action="${action}"]`);
    if (!item) return;

    const upgradesManager = this.factory.getUpgradesManager();
    const strategy = upgradesManager.getStrategy(upgradeId);

    const titleEl = item.querySelector(".upgradeTitle > b");
    if (titleEl) titleEl.textContent = strategy.getTitle();

    const descriptionEl = item.querySelector(".upgradeDescription");
    if (descriptionEl) {
      descriptionEl.innerHTML = strategy.getDescription();
    }

    if (action === "buy") {
      const moneyEl = item.querySelector(".money");
      if (moneyEl) {
        moneyEl.textContent = numberFormat.formatNumber(upgradesManager.getPrice(upgradeId));
      }

      const isMaxed = !upgradesManager.couldPurchase(upgradeId);
      item.classList.toggle("upgradeItemMaxed", isMaxed);
      item.classList.toggle("upgradeItemCantBuy", !isMaxed && !upgradesManager.canPurchase(upgradeId));
    } else if (action === "sell") {
      const moneyEl = item.querySelector(".money");
      if (moneyEl) {
        moneyEl.textContent = numberFormat.formatNumber(upgradesManager.getSellPrice(upgradeId));
      }
      item.classList.toggle("upgradeItemCantSell", !upgradesManager.canSell(upgradeId));
    }
  }

  update() {
    const moneyEl = document.querySelector("#money");
    if (moneyEl) {
      moneyEl.textContent = numberFormat.formatNumber(this.game.getMoney());
    }

    this.container.querySelectorAll(".upgradeItem").forEach((el) => {
      const id = el.dataset.id;
      const action = el.dataset.action;

      const upgradesManager = this.factory.getUpgradesManager();

      const upgradeValue = upgradesManager.getUpgrade(id);
      const iconEl = el.querySelector(".upgradeIcon");
      const boughtEl = el.querySelector(".upgradePopup .bought");
      if (iconEl) iconEl.textContent = upgradeValue;
      if (boughtEl) boughtEl.textContent = upgradeValue;

      if (action === "buy") {
        if (!upgradesManager.couldPurchase(id)) {
          el.classList.add("upgradeItemMaxed");
        } else {
          el.classList.remove("upgradeItemMaxed");
          if (upgradesManager.canPurchase(id)) {
            el.classList.remove("upgradeItemCantBuy");
          } else {
            el.classList.add("upgradeItemCantBuy");
          }
        }
      } else if (action === "sell") {
        if (upgradesManager.canSell(id)) {
          el.classList.remove("upgradeItemCantSell");
        } else {
          el.classList.add("upgradeItemCantSell");
        }
      }
    });
  }

  destroy(removeContent = true) {
    this.game.getEventManager().removeListenerForType("upgradeUi");
    this.factory.getEventManager().removeListenerForType("upgradeUi");
    this.gameUiEm.removeListenerForType("upgradeUi");
    this.tooltipDestroyers?.forEach((destroy) => destroy());
    this.tooltipDestroyers = [];
    if (removeContent && this.container) this.container.innerHTML = "";
    this.container = removeContent ? null : this.container;
  }
}
