// MapUi.js
import BackgroundLayer from "./mapLayers/BackgroundLayer.js";
import ComponentLayer from "./mapLayers/ComponentLayer.js";
import PackageLayer from "./mapLayers/PackageLayer.js";
import DirectNeighborFlowLayer from "./mapLayers/DirectNeighborFlowLayer.js";
import MouseLayer from "./mapLayers/MouseLayer.js";
import AreasLayer from "./mapLayers/AreasLayer.js";
import TileCoordsLayer from "./mapLayers/TileCoordsLayer.js";
import ScreenShotUi from "./ScreenShotUi.js";
import GlobalUiBus from "../../base/GlobalUiBus.js";
import GlobalUiEvent from "../../config/event/GlobalUiEvent.js";
import FactoryEvent from "../../config/event/FactoryEvent.js"; // assuming

export default class MapUi {
  constructor(factory, imageMap) {
    this.globalUiEm = GlobalUiBus;
    this.imageMap = imageMap;
    this.factory = factory;
    this.game = factory.getGame();
    this.tileSize = 21;

    this.backgroundLayer = new BackgroundLayer(this.imageMap, factory, { tileSize: this.tileSize });
    this.componentLayer = new ComponentLayer(this.imageMap, factory, { tileSize: this.tileSize });
    this.packageLayer = new PackageLayer(this.imageMap, factory, { tileSize: this.tileSize });
    //this.directNeighborFlowLayer = new DirectNeighborFlowLayer(factory, { tileSize: this.tileSize });
    this.mouseLayer = new MouseLayer(this.imageMap, factory, { tileSize: this.tileSize });
    this.areasLayer = new AreasLayer(this.imageMap, factory, { tileSize: this.tileSize });
    this.tileCoordsLayer = this.game.isDevMode ? new TileCoordsLayer(factory, { tileSize: this.tileSize }) : null;
  }

  display(container) {
    this.container = container;

    const mapW = this.factory.getMeta().tilesX * this.tileSize;
    const mapH = this.factory.getMeta().tilesY * this.tileSize;

    this.overlay = document.createElement("div");
    Object.assign(this.overlay.style, {
      overflow: "hidden",
      margin: "0",
      width: "100%",
      height: "100%",
      position: "relative",
    });

    this.element = document.createElement("div");
    Object.assign(this.element.style, {
      position: "absolute",
      width: `${mapW}px`,
      height: `${mapH}px`,
      left: "0px",
      top: "0px",
    });

    this.overlay.append(this.element);
    this.container.append(this.overlay);

    this.setupMapDragging();

    this.backgroundLayer.display(this.element);
    if (this.tileCoordsLayer) {
      this.tileCoordsLayer.display(this.element);
      this.tileCoordsLayer.setVisible(this.game.showTileCoords);
    }
    this.componentLayer.display(this.element);
    
    this.packageLayer.display(this.element);
    //this.directNeighborFlowLayer.display(this.element);
    this.mouseLayer.display(this.element);
    this.areasLayer.display(this.element);

    this.globalUiEm.addListener("FactoryMapUi", FactoryEvent.OPEN_SCREENSHOT_VIEW, () => {
      new ScreenShotUi(
        this.factory,
        { tileSize: this.tileSize },
        this.backgroundLayer.getCanvas(),
        this.componentLayer.getCanvas(),
        this.packageLayer.getCanvas(),
        //this.directNeighborFlowLayer.getCanvas()
      ).open();
    });

    this.globalUiEm.addListener("FactoryMapUi", GlobalUiEvent.TILE_COORDS_CHANGED, () => {
      if (this.tileCoordsLayer) this.tileCoordsLayer.setVisible(this.game.showTileCoords);
    });
  }

  setupMapDragging() {
    let allowDrag = true;

    this.factory.getEventManager().addListener("FactoryMapUi", FactoryEvent.COMPONENT_META_SELECTED, e => {
      const meta = this.game.getMeta().componentsById[e];
      allowDrag = !meta || !meta.buildByDragging;
    });

    let startX, startY, startLeft, startTop;

    const moveHandler = evt => {
      const dx = evt.pageX - startX;
      const dy = evt.pageY - startY;

      this.setElementOffset(startLeft + dx, startTop + dy);
      this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_SCROLL_START);
    };

    const upHandler = () => {
      document.body.removeEventListener("pointermove", moveHandler);
      document.body.removeEventListener("pointerup", upHandler);
      this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_SCROLL_END);
    };

    this.element.addEventListener("pointerdown", e => {
      if (e.button === 0 && !e.shiftKey && !e.altKey && allowDrag) {
        startX = e.pageX;
        startY = e.pageY;
        const rect = this.element.getBoundingClientRect();
        startLeft = parseInt(this.element.style.left || "0", 10);
        startTop = parseInt(this.element.style.top || "0", 10);

        document.body.addEventListener("pointermove", moveHandler);
        document.body.addEventListener("pointerup", upHandler);
      }
    });

    // center view initially
    const startLeftOffset = -this.factory.getMeta().startX * this.tileSize;
    const startTopOffset = -this.factory.getMeta().startY * this.tileSize;
    this.setElementOffset(startLeftOffset, startTopOffset);
  }

  setElementOffset(left, top) {
    const clamped = this.clampOffset(left, top);
    this.element.style.left = `${clamped.left}px`;
    this.element.style.top = `${clamped.top}px`;
  }

  clampOffset(left, top) {
    const overlayRect = this.overlay.getBoundingClientRect();
    const elemRect = this.element.getBoundingClientRect();

    const maxLeft = 0;
    const minLeft = this.overlay.clientWidth - this.element.offsetWidth;

    const maxTop = 0;
    const minTop = this.overlay.clientHeight - this.element.offsetHeight;

    return {
      left: Math.min(Math.max(left, minLeft), maxLeft),
      top: Math.min(Math.max(top, minTop), maxTop),
    };
  }

  destroy() {
    this.globalUiEm.removeListener("FactoryMapUi", GlobalUiEvent.TILE_COORDS_CHANGED);
    this.factory.getEventManager().removeListenerForType("FactoryMapUi");
    this.backgroundLayer.destroy();
    if (this.tileCoordsLayer) this.tileCoordsLayer.destroy();
    this.componentLayer.destroy();
    this.packageLayer.destroy();
    //this.directNeighborFlowLayer.destroy();
    this.mouseLayer.destroy();
    this.areasLayer.destroy();
    this.container.innerHTML = "";
    this.container = null;
  }
}
