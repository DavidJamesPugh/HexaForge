// src/ui/factory/mapLayers/helper/MouseInfoHelper.js
import BuyComponentAction from "../../../../game/action/BuyComponentAction.js";
import TipUi from "../../../../ui/helper/TipUi.js";

export default class MouseInfoHelper {
  container = null;
  lastTip = null;
  mouseSelectionElement = null;
  cantPlaceElement = null;
  componentSelectedElement = null;

  constructor(factory, imageMap, tileSize) {
    this.factory = factory;
    this.game = factory.getGame();
    this.imageMap = imageMap;
    this.tileSize = tileSize;
  }

  display(container) {
    this.container = container;
  }

  destroy() {
    this.container = null;
    this.turnOffBuildMode();
    this.turnOffCantBuildMode();
    this.turnOffComponentSelected();
    this.turnOffNotEnoughMoneyTip();
  }

  updateMouseInformationModes(componentId, pos) {
    if (!componentId || !pos) {
        this.turnOffBuildMode();
        this.turnOffCantBuildMode();
        this.turnOffNotEnoughMoneyTip();
        return;
    }

    const compMeta = this.game.getMeta().componentsById[componentId];
    const tile = this.factory.getTile(pos.x, pos.y);
    const buyAction = new BuyComponentAction(tile, compMeta);

    const isOutOfMap = !this.factory.isOnMap(pos.x, pos.y, compMeta.width, compMeta.height);
    const canBuildType = this.factory.isPossibleToBuildOnTypeWithSize(
        pos.x, pos.y, compMeta.width, compMeta.height, compMeta
    );
    const canBuildArea = this.factory.getAreasManager().canBuildAt(
        pos.x, pos.y, compMeta.width, compMeta.height
    );

    // Handle build mode / out-of-map
    isOutOfMap ? this.turnOffBuildMode() : this.updateBuildMode(componentId, pos);

    // Handle cant-build / not-enough-money tips
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
        this.turnOffNotEnoughMoneyTip();
    }
}


  updateComponentSelected(component) {
    if (!component) return this.turnOffComponentSelected();

    const meta = component.getMeta();
    if (!this.componentSelectedElement) {
      this.componentSelectedElement = this.createImageElement(this.imageMap.getImage("blueSelection"));
      this.container.appendChild(this.componentSelectedElement);
    }

    this.setElementStyle(this.componentSelectedElement, {
      left: component.getX() * this.tileSize + "px",
      top: component.getY() * this.tileSize + "px",
      width: this.tileSize * meta.width + "px",
      height: this.tileSize * meta.height + "px",
      opacity: 0.5,
      pointerEvents: "none",
      position: "absolute",
    });
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
      this.mouseSelectionElement = this.createImageElement(this.imageMap.getImage("yellowSelection"));
      this.container.appendChild(this.mouseSelectionElement);
    }

    this.setElementStyle(this.mouseSelectionElement, {
      left: pos.x * this.tileSize + "px",
      top: pos.y * this.tileSize + "px",
      width: this.tileSize * meta.width + "px",
      height: this.tileSize * meta.height + "px",
      opacity: 0.5,
      pointerEvents: "none",
      position: "absolute",
    });
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
      this.cantPlaceElement = this.createImageElement(this.imageMap.getImage("cantPlace"));
      this.container.appendChild(this.cantPlaceElement);
    }

    this.setElementStyle(this.cantPlaceElement, {
      left: pos.x * this.tileSize + "px",
      top: pos.y * this.tileSize + "px",
      width: this.tileSize * meta.width + "px",
      height: this.tileSize * meta.height + "px",
      opacity: 0.5,
      pointerEvents: "none",
      position: "absolute",
    });
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
      document.body.style.cursor = "no-drop";
    }
  }

  turnOffNotEnoughMoneyTip() {
    if (this.lastTip) {
      this.lastTip.destroy();
      this.lastTip = null;
      document.body.style.cursor = "";
    }
  }

  // --- Helper functions ---

  createImageElement(image) {
    const img = document.createElement("img");
    img.src = image.src; // <-- use the loaded image src
    img.style.position = "absolute";
    img.style.pointerEvents = "none";
    img.style.opacity = 0.5;
    return img;
  }

  setElementStyle(el, styles) {
    Object.assign(el.style, styles);
  }
}
