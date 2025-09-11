
  
  // src/ui/UpgradesUi.js
  import template from '/js/template/upgrades.html';
  import BuyUpgrade from '/js/game/action/BuyUpgrade';
  import SellUpgrade from '/js/game/action/SellUpgrade';
  import TipUi from '/js/ui/helper/TipUi';
  import GameContext from "../base/GameContext.js";
  import GameUiEvent from "../config/event/GameUiEvent.js";
  import GameEvent from "../config/event/GameEvent.js";

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
        if (groupMeta.type === 'break') {
          groups.push({ isBreak: true });
          continue;
        }
  
        const upgrades = [];
        for (const id of groupMeta.items) {
          if (id === '_') continue;
  
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
              action: 'sell',
              isSell: true,
              canSell: upgradesManager.canSell(upgradeMeta.id),
              sellPrice: nf(upgradesManager.getSellPrice(upgradeMeta.id)),
              refund: `${100 * upgradeMeta.refund}%`,
              title: strategy.getTitle(),
              description: strategy.getDescription(),
              iconStyle: `background-position: -${26 * upgradeMeta.iconX}px -${26 * upgradeMeta.iconY}px`,
            });
          }
          upgrades.push({
            id: upgradeMeta.id,
            action: 'buy',
            isBuy: true,
            isMaxed: !upgradesManager.couldPurchase(upgradeMeta.id),
            buyPrice: nf(upgradesManager.getPrice(upgradeMeta.id)),
            title: strategy.getTitle(),
            description: strategy.getDescription(),
            iconStyle: `background-position: -${26 * upgradeMeta.iconX}px -${26 * upgradeMeta.iconY}px`,
          });
        }
  
        if (upgrades.length) upgrades.reverse();
        groups.push({
          name: groupMeta.name,
          upgrades,
          iconStyle: `background-position: -${26 * groupMeta.iconX}px -${26 * groupMeta.iconY}px`,
        });
      }
  
      this.container.html(Handlebars.compile(template)({ groups }));
  
      // Back button
      this.container.find('.backButton').off('click').on('click', () => {
        this.gameUiEm.invokeEvent(GameUiEvent.SHOW_FACTORY);
      });
  
      // Upgrade click handling
      this.container.find('.upgradeItem').each((_, el) => {
        const $el = $(el);
        const id = $el.attr('data-id');
        const actionType = $el.attr('data-action');
  
        new TipUi($el, $el.find('.upgradePopup')).init();
  
        $el.off('click').on('click', () => {
          if (actionType === 'sell') {
            const action = new SellUpgrade(this.factory, id);
            if (action.canSell()) action.sell();
          } else if (actionType === 'buy') {
            const action = new BuyUpgrade(this.factory, id);
            if (action.canBuy()) action.buy();
          }
          this.refreshView();
        });
      });
  
      this.game.getEventManager().addListener('upgradeUi', GameEvent.GAME_TICK, () => this.update());
      this.update();
    }
  
    refreshView() {
      const currentContainer = this.container;
      this.destroy();
      this.display(currentContainer);
    }
  
    update() {
      $('#money').html(nf(this.game.getMoney()));
      this.container.find('.upgradeItem').each((_, el) => {
        const $el = $(el);
        const id = $el.attr('data-id');
        const action = $el.attr('data-action');
  
        $el.find('.upgradeIcon').html(this.factory.getUpgradesManager().getUpgrade(id));
        $el.find('.upgradePopup .bought').html(this.factory.getUpgradesManager().getUpgrade(id));
  
        if (action === 'buy') {
          if (!this.factory.getUpgradesManager().couldPurchase(id)) {
            $el.addClass('upgradeItemMaxed');
          } else {
            $el.removeClass('upgradeItemMaxed');
            this.factory.getUpgradesManager().canPurchase(id)
              ? $el.removeClass('upgradeItemCantBuy')
              : $el.addClass('upgradeItemCantBuy');
          }
        } else if (action === 'sell') {
          this.factory.getUpgradesManager().canSell(id)
            ? $el.removeClass('upgradeItemCantSell')
            : $el.addClass('upgradeItemCantSell');
        }
      });
    }
  
    destroy() {
      this.game.getEventManager().removeListenerForType('upgradeUi');
      this.gameUiEm.removeListenerForType('upgradeUi');
      if (this.container) this.container.html('');
      this.container = null;
    }
  }
  