import FactoryEvent from "../../config/event/FactoryEvent.js";

export default class BuyComponentAction {
  constructor(tile, componentMeta) {
    this.tile = tile;
    this.factory = tile.getFactory();
    this.componentMeta = componentMeta;
  }

  static possibleToBuy(factory, componentMeta) {
    return factory.getGame().isDevMode ||
           !componentMeta.requiresResearch || 
           factory.getGame().getResearchManager().getResearch(componentMeta.requiresResearch) > 0;
  }

  canBuy() {
    const isDevMode = this.factory.getGame().isDevMode;
    return (
      this.factory.isPossibleToBuildOnTypeWithSize(
        this.tile.getX(),
        this.tile.getY(),
        this.componentMeta.footprintWidth,
        this.componentMeta.footprintHeight,
        this.componentMeta
      ) &&
      (isDevMode || !(this.componentMeta.price > this.factory.getGame().getMoney())) &&
      BuyComponentAction.possibleToBuy(this.factory, this.componentMeta) &&
      (isDevMode || this.factory.getAreasManager().canBuildAt(
        this.tile.getX(),
        this.tile.getY(),
        this.componentMeta.footprintWidth,
        this.componentMeta.footprintHeight
      ))
    );
  }

  buy() {
    this.factory.getGame().addMoney(-this.componentMeta.price);
    this.buyFree();
  }

  buyFree() {
    this.tile.setComponent(this.componentMeta);
    this.factory.getEventManager().invokeEvent(
      FactoryEvent.FACTORY_COMPONENTS_CHANGED, 
      this.tile
    );
  }
}
