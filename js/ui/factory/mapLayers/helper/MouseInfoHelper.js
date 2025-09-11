// src/ui/factory/mapLayers/helper/MouseInfoHelper.js
import BuyComponentAction from "../../../../game/action/BuyComponentAction.js";
import TipUi from "../../../../ui/helper/TipUi.js";

class MouseInfoHelper {
  constructor(factory, imageMap, tileSize) {
    this.factory = factory;
    this.game = factory.getGame();
    this.imageMap = imageMap;
    this.tileSize = tileSize;
    this.lastTip = null;
  }

  display(container) {
    this.container = container;
  }

  destroy() {
    this.container = null;
  }

  updateMouseInformationModes(componentId, pos) {
    if (!pos || !componentId) {
      this.turnOffBuildMode();
      this.turnOffCantBuildMode();
      this.turnOffNotEnoughMoneyTip();
      return;
    }

    const compMeta = this.game.getMeta().componentsById[componentId];
    const canBuildType = this.factory.isPossibleToBuildOnTypeWithSize(
      pos.x,
      pos.y,
      compMeta.width,
      compMeta.height,
      compMeta
    );
    const canBuildArea = this.factory
      .getAreasManager()
      .canBuildAt(pos.x, pos.y, compMeta.width, compMeta.height);
    const isOutOfMap = !this.factory.isOnMap(
      pos.x,
      pos.y,
      compMeta.width,
      compMeta.height
    );

    const tile = this.factory.getTile(pos.x, pos.y);
    const buyAction = new BuyComponentAction(tile, compMeta);

    if (isOutOfMap) {
      this.turnOffBuildMode();
    } else {
      this.updateBuildMode(componentId, pos);
    }

    if ((canBuildType && canBuildArea) || isOutOfMap) {
      if (buyAction.canBuy()) {
        this.turnOffCantBuildMode();
        this.turnOffNotEnoughMoneyTip();
      } else {
        this.updateCantBuildMode(componentId, pos);
        this.updateNotEnoughMoneyTip();
      }
    } else {
      this.updateCantBuildMode(componentId, pos);
    }
  }

  updateComponentSelected(component) {
    if (!component) {
      this.turnOffComponentSelected();
      return;
    }

    const meta = component.getMeta();
    if (!this.componentSelectedElement) {
      this.componentSelectedElement = $(this.imageMap.getImage("blueSelection"));
      this.container.append(this.componentSelectedElement);
    }

    this.componentSelectedElement
      .css("position", "absolute")
      .css("opacity", 0.5)
      .css("pointer-events", "none")
      .css("left", component.getX() * this.tileSize)
      .css("top", component.getY() * this.tileSize)
      .css("width", this.tileSize * meta.width)
      .css("height", this.tileSize * meta.height);
  }

  turnOffComponentSelected() {
    if (this.componentSelectedElement) {
      this.componentSelectedElement.remove();
      this.componentSelectedElement = null;
    }
  }

  updateBuildMode(componentId, pos) {
    const meta = this.game.getMeta().componentsById[componentId];
    if (!this.mouseSelectionElement) {
      this.mouseSelectionElement = $(this.imageMap.getImage("yellowSelection"));
      this.container.append(this.mouseSelectionElement);
    }

    this.mouseSelectionElement
      .css("position", "absolute")
      .css("opacity", 0.5)
      .css("pointer-events", "none")
      .css("left", pos.x * this.tileSize)
      .css("top", pos.y * this.tileSize)
      .css("width", this.tileSize * meta.width)
      .css("height", this.tileSize * meta.height);
  }

  turnOffBuildMode() {
    if (this.mouseSelectionElement) {
      this.mouseSelectionElement.remove();
      this.mouseSelectionElement = null;
    }
  }

  updateCantBuildMode(componentId, pos) {
    const meta = this.game.getMeta().componentsById[componentId];
    if (!this.cantPlaceElement) {
      this.cantPlaceElement = $(this.imageMap.getImage("cantPlace"));
      this.container.append(this.cantPlaceElement);
    }

    this.cantPlaceElement
      .css("position", "absolute")
      .css("opacity", 0.5)
      .css("pointer-events", "none")
      .css("left", pos.x * this.tileSize)
      .css("top", pos.y * this.tileSize)
      .css("width", this.tileSize * meta.width)
      .css("height", this.tileSize * meta.height);
  }

  turnOffCantBuildMode() {
    if (this.cantPlaceElement) {
      this.cantPlaceElement.remove();
      this.cantPlaceElement = null;
    }
  }

  updateNotEnoughMoneyTip() {
    if (!this.lastTip) {
      this.lastTip = new TipUi(
        this.container,
        `<span class="red">You don't have enough money!</span>`
      ).init();
      $("body").css("cursor", "no-drop");
    }
  }

  turnOffNotEnoughMoneyTip() {
    if (this.lastTip) {
      this.lastTip.destroy();
      this.lastTip = null;
      $("body").css("cursor", "");
    }
  }
}

export default MouseInfoHelper;
