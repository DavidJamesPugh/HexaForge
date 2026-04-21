// src/ui/factory/mapLayers/helper/MouseInfoHelper.js
import BuyComponentAction from "../../../../game/action/BuyComponentAction.js";
import ComponentFootprint from "../../../../game/ComponentFootprint.js";
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

    const compMeta = ComponentFootprint.ensurePrepared(this.game.getMeta().componentsById[componentId]);
    const tile = this.factory.getTile(pos.x, pos.y);
    const buyAction = new BuyComponentAction(tile, compMeta);

    const isOutOfMap = !this.factory.isOnMap(pos.x, pos.y, compMeta.footprintWidth, compMeta.footprintHeight);
    const canBuildType = this.factory.isPossibleToBuildOnTypeWithSize(
        pos.x, pos.y, compMeta.footprintWidth, compMeta.footprintHeight, compMeta
    );
    const canBuildArea = this.factory.getAreasManager().canBuildAt(
        pos.x, pos.y, compMeta.footprintWidth, compMeta.footprintHeight
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

    const meta = ComponentFootprint.ensurePrepared(component.getMeta());
    if (!this.componentSelectedElement) {
      this.componentSelectedElement = this._createFootprintOverlayRoot();
      this.container.appendChild(this.componentSelectedElement);
    }

    this._layoutFootprintOverlay(this.componentSelectedElement, component.getX(), component.getY(), meta, "blueSelection", "rgba(56, 189, 248, 0.35)");
  }

  turnOffComponentSelected() {
    if (this.componentSelectedElement) {
      this.componentSelectedElement.remove();
      this.componentSelectedElement = null;
    }
  }

  updateBuildMode(componentId, pos) {
    const meta = ComponentFootprint.ensurePrepared(this.game.getMeta().componentsById[componentId]);
    if (!this.mouseSelectionElement) {
      this.mouseSelectionElement = this._createFootprintOverlayRoot();
      this.container.appendChild(this.mouseSelectionElement);
    }

    this._layoutFootprintOverlay(this.mouseSelectionElement, pos.x, pos.y, meta, "yellowSelection", "rgba(250, 204, 21, 0.4)");
  }

  turnOffBuildMode() {
    if (this.mouseSelectionElement) {
      this.mouseSelectionElement.remove();
      this.mouseSelectionElement = null;
    }
  }

  updateCantBuildMode(componentId, pos) {
    const meta = ComponentFootprint.ensurePrepared(this.game.getMeta().componentsById[componentId]);
    if (!this.cantPlaceElement) {
      this.cantPlaceElement = this._createFootprintOverlayRoot();
      this.container.appendChild(this.cantPlaceElement);
    }

    this._layoutFootprintOverlay(this.cantPlaceElement, pos.x, pos.y, meta, "cantPlace", "rgba(248, 113, 113, 0.45)");
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

  _createFootprintOverlayRoot() {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.pointerEvents = "none";
    el.style.zIndex = "100";
    el.style.width = "0";
    el.style.height = "0";
    el.style.overflow = "visible";
    return el;
  }

  /**
   * One tile-sized overlay per occupied cell so L-shapes match the footprint (not the bbox).
   */
  _layoutFootprintOverlay(root, anchorX, anchorY, meta, imageName, fallbackColor) {
    root.replaceChildren();
    this.setElementStyle(root, {
      left: anchorX * this.tileSize + "px",
      top: anchorY * this.tileSize + "px",
    });
    for (const { dx, dy } of meta.occupiedCells) {
      const cell = this.createOverlayElement(fallbackColor, imageName);
      this.setElementStyle(cell, {
        position: "absolute",
        left: dx * this.tileSize + "px",
        top: dy * this.tileSize + "px",
        width: this.tileSize + "px",
        height: this.tileSize + "px",
      });
      root.appendChild(cell);
    }
  }

  createOverlayElement(color, imageName) {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.pointerEvents = "none";
    el.style.zIndex = "100";

    const image = this.imageMap.getImage(imageName);
    if (image && image.complete && image.naturalWidth > 0) {
      el.style.backgroundImage = `url(${image.src})`;
      el.style.backgroundSize = "100% 100%";
      el.style.opacity = "0.5";
    } else {
      el.style.backgroundColor = color;
    }
    return el;
  }

  setElementStyle(el, styles) {
    Object.assign(el.style, styles);
  }
}
