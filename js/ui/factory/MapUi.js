// MapUi.js
import BackgroundLayer from "./mapLayers/BackgroundLayer.js";
import ComponentLayer from "./mapLayers/ComponentLayer.js";
import PackageLayer from "./mapLayers/PackageLayer.js";
import MouseLayer from "./mapLayers/MouseLayer.js";
import AreasLayer from "./mapLayers/AreasLayer.js";
import ScreenShotUi from "./ScreenShotUi.js";

export default class MapUi {
  constructor(globalUiEm, imageMap, factory) {
    this.globalUiEm = globalUiEm;
    this.imageMap = imageMap;
    this.factory = factory;
    this.game = factory.getGame();
    this.tileSize = 21;

    this.backgroundLayer = new BackgroundLayer(imageMap, factory, { tileSize: this.tileSize });
    this.componentLayer = new ComponentLayer(imageMap, factory, { tileSize: this.tileSize });
    this.packageLayer = new PackageLayer(imageMap, factory, { tileSize: this.tileSize });
    this.mouseLayer = new MouseLayer(imageMap, factory, { tileSize: this.tileSize });
    this.areasLayer = new AreasLayer(imageMap, factory, { tileSize: this.tileSize });
  }

  display(container) {
    this.container = container;
    const containerW = this.container.width();
    const containerH = this.container.height();
    const mapW = this.factory.getMeta().tilesX * this.tileSize;
    const mapH = this.factory.getMeta().tilesY * this.tileSize;

    this.overlay = $("<div />")
      .css("overflow", "hidden")
      .css("margin", "0 0 0 0")
      .css("width", Math.min(containerW, mapW))
      .css("height", Math.min(containerH, mapH));

    this.element = $("<div />")
      .css("position", "relative")
      .css("width", mapW + "px")
      .css("height", mapH + "px");

    this.overlay.html(this.element);
    this.container.html(this.overlay);

    this.setupMapDragging();
    this.backgroundLayer.display(this.element);
    this.componentLayer.display(this.element);
    this.packageLayer.display(this.element);
    this.mouseLayer.display(this.element);
    this.areasLayer.display(this.element);

    this.globalUiEm.addListener("FactoryMapUi", FactoryEvent.OPEN_SCREENSHOT_VIEW, () => {
      new ScreenShotUi(
        this.factory,
        { tileSize: this.tileSize },
        this.backgroundLayer.getCanvas(),
        this.componentLayer.getCanvas(),
        this.packageLayer.getCanvas()
      ).open();
    });
  }

  setupMapDragging() {
    let allowDrag = true;

    this.factory.getEventManager().addListener("FactoryMapUi", FactoryEvent.COMPONENT_META_SELECTED, e => {
      const meta = this.game.getMeta().componentsById[e];
      allowDrag = !meta || !meta.buildByDragging;
    });

    this.element.get(0).addEventListener("mousedown", e => {
      if (e.which === 1 && !e.shiftKey && !e.altKey && allowDrag) {
        const startX = e.pageX;
        const startY = e.pageY;
        const startOffset = this.element.offset();
        const overlayOffset = this.overlay.offset();

        const moveHandler = evt => {
          const dx = evt.pageX - startX;
          const dy = evt.pageY - startY;
          this.element.offset(this.clampOffset(startOffset.left + dx, startOffset.top + dy));
          this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_SCROLL_START);
        };

        const upHandler = () => {
          $("body").off("mousemove", moveHandler).off("mouseleave", upHandler).off("mouseup", upHandler);
          this.factory.getEventManager().invokeEvent(FactoryEvent.FACTORY_SCROLL_END);
        };

        $("body").on("mouseup", upHandler).on("mouseleave", upHandler).on("mousemove", moveHandler);
      }
    });

    // center view initially
    const offset = this.overlay.offset();
    let left = offset.left;
    let top = offset.top;
    if (this.overlay.width() < this.element.width()) {
      left = -this.factory.getMeta().startX * this.tileSize + offset.left;
    }
    if (this.overlay.height() < this.element.height()) {
      top = -this.factory.getMeta().startY * this.tileSize + offset.top;
    }
    this.element.offset(this.clampOffset(left, top));
  }

  clampOffset(left, top) {
    const overlayOffset = this.overlay.offset();
    const maxLeft = overlayOffset.left;
    const minLeft = overlayOffset.left - this.element.width() + this.overlay.width();

    const maxTop = overlayOffset.top;
    const minTop = overlayOffset.top - this.element.height() + this.overlay.height();

    return {
      left: Math.min(Math.max(left, minLeft), maxLeft),
      top: Math.min(Math.max(top, minTop), maxTop),
    };
  }

  destroy() {
    this.factory.getEventManager().removeListenerForType("FactoryMapUi");
    this.backgroundLayer.destroy();
    this.componentLayer.destroy();
    this.packageLayer.destroy();
    this.mouseLayer.destroy();
    this.areasLayer.destroy();
    this.container.html("");
    this.container = null;
  }
}
