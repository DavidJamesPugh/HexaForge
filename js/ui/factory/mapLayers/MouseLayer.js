// src/ui/factory/mapLayers/MouseLayer.js
import BuyComponentAction from "../../../game/action/BuyComponentAction.js";
import SellComponentAction from "../../../game/action/SellComponentAction.js";
import UpdateComponentInputOutputAction from "../../../game/action/UpdateComponentInputOutputAction.js";
import UpdateTileAction from "../../../game/action/UpdateTileAction.js";
import MouseInfoHelper from "./helper/MouseInfoHelper.js";
import FactoryEvent from "/js/config/event/FactoryEvent.js"; // assuming

const LAYER_MOUSE = "LayerMouse";

class MouseLayer {
  constructor(imageMap, factory, options) {
    this.imageMap = imageMap;
    this.factory = factory;
    this.game = factory.getGame();
    this.tileSize = options.tileSize;
    this.tilesX = factory.getMeta().tilesX;
    this.tilesY = factory.getMeta().tilesY;
    this.selectedComponentMetaId = null;
    this.selectedMapToolId = null;
    this.clickedComponent = null;
    this.mouseInfoHelper = new MouseInfoHelper(factory, imageMap, options.tileSize);
  }

  display(container) {
    this.selectedComponentMetaId = null;
    this.container = container;
    const windowXY = this.tilesX * this.tileSize;
    this.element = document.createElement("div");
    
    Object.assign(this.element.style, {
      position: "absolute",
      width: `${windowXY}px`,
      height: `${windowXY}px`
    });
    this.container.append(this.element);

    this._setupNativePointerEvents();
    this._setupMouseListeners();
    this.mouseInfoHelper.display(container);
  }

  _setupMouseListeners() {
    let downEvent = null;
    let lastMove = null;
    let lastClickedComponent = null;

    this.factory.getEventManager().addListener(
      LAYER_MOUSE,
      FactoryEvent.FACTORY_MOUSE_MOVE,
      (event) => {
        if (downEvent && downEvent.altKeyDown) {
          this.updateTileMeta(downEvent);
          this.updateTileMeta(event);
        } else if (this.selectedComponentMetaId) {
          this.mouseInfoHelper.updateMouseInformationModes(
            this.selectedComponentMetaId,
            event
          );

          const meta =
            this.game.getMeta().componentsById[this.selectedComponentMetaId];

          if (
            downEvent &&
            event.leftMouseDown &&
            !downEvent.shiftKeyDown &&
            meta.buildByDragging === 1
          ) {
            this.buyComponent(downEvent);
            this.buyComponent(event);
            this.connectComponents(lastMove, event);
          } else if (
            downEvent &&
            ((event.leftMouseDown && downEvent.shiftKeyDown) ||
              event.rightMouseDown)
          ) {
            this.sellComponent(downEvent);
            this.sellComponent(event);
          }
        } else if (
          downEvent &&
          ((event.leftMouseDown && downEvent.shiftKeyDown) ||
            event.rightMouseDown)
        ) {
          this.sellComponent(downEvent);
          this.sellComponent(event);
        }
        lastMove = event;
      }
    );

    this.factory.getEventManager().addListener(
      LAYER_MOUSE,
      FactoryEvent.FACTORY_MOUSE_OUT,
      () => {
        this.mouseInfoHelper.turnOffBuildMode();
        this.mouseInfoHelper.turnOffCantBuildMode();
        downEvent = null;
        lastMove = null;
      }
    );

    this.factory.getEventManager().addListener(
      LAYER_MOUSE,
      FactoryEvent.FACTORY_MOUSE_DOWN,
      (event) => {
        downEvent = event;
      }
    );

    this.factory.getEventManager().addListener(
      LAYER_MOUSE,
      FactoryEvent.FACTORY_MOUSE_UP,
      (event) => {
        if (downEvent && downEvent.x === event.x && downEvent.y === event.y) {
          let comp = this.factory.getTile(event.x, event.y).getComponent();

          if (downEvent.altKeyDown) {
            this.updateTileMeta(event);
          } else if (this.selectedComponentMetaId) {
            if (downEvent.leftMouseDown && !downEvent.shiftKeyDown) {
              this.buyComponent(downEvent);
            } else if (
              (downEvent.leftMouseDown && downEvent.shiftKeyDown) ||
              downEvent.rightMouseDown
            ) {
              this.sellComponent(downEvent);
            }
          } else if (
            !this.selectedComponentMetaId &&
            ((downEvent.leftMouseDown && downEvent.shiftKeyDown) ||
              downEvent.rightMouseDown)
          ) {
            this.sellComponent(downEvent);
          } else if (comp) {
            if (lastClickedComponent === comp) comp = null;
            this.factory.getEventManager().invokeEvent(
              FactoryEvent.COMPONENT_SELECTED,
              comp
            );
            lastClickedComponent = comp;
          }
        }
        downEvent = null;
      }
    );

    this.factory.getEventManager().addListener(
      LAYER_MOUSE,
      FactoryEvent.COMPONENT_META_SELECTED,
      (id) => {
        this.factory.getEventManager().invokeEvent(
          FactoryEvent.COMPONENT_SELECTED,
          null
        );
        this.selectedComponentMetaId = id;
        this.mouseInfoHelper.updateMouseInformationModes(id, lastMove);
        lastClickedComponent = null;
      }
    );

    this.factory.getEventManager().addListener(
      LAYER_MOUSE,
      FactoryEvent.MAP_TOOL_SELECTED,
      (id) => {
        this.factory.getEventManager().invokeEvent(
          FactoryEvent.COMPONENT_SELECTED,
          null
        );
        this.selectedMapToolId = id;
        lastClickedComponent = null;
      }
    );

    this.factory.getEventManager().addListener(
      LAYER_MOUSE,
      FactoryEvent.COMPONENT_SELECTED,
      (comp) => {
        this.mouseInfoHelper.updateComponentSelected(comp);
      }
    );
  }

  updateTileMeta(event) {
    const action = new UpdateTileAction(
      this.factory.getTile(event.x, event.y),
      this.selectedMapToolId
    );
    if (action.canUpdate()) action.update();
  }

  buyComponent(event) {
    const action = new BuyComponentAction(
      this.factory.getTile(event.x, event.y),
      this.game.getMeta().componentsById[this.selectedComponentMetaId]
    );
    if (action.canBuy()) action.buy();
  }

  sellComponent(event) {
    const meta = this.game.getMeta().componentsById[this.selectedComponentMetaId];
    const action = new SellComponentAction(
      this.factory.getTile(event.x, event.y),
      meta ? meta.width : 1,
      meta ? meta.height : 1
    );
    if (action.canSell()) action.sell();
  }

  connectComponents(eventA, eventB) {
    const action = new UpdateComponentInputOutputAction(
      this.factory.getTile(eventA.x, eventA.y),
      this.factory.getTile(eventB.x, eventB.y)
    );
    if (action.canUpdate()) action.update();
  }

  _setupNativePointerEvents() {
    let lastEvent = null;
    const element = this.element; // must be a real DOM element
  
    element.addEventListener("pointerout", () => {
      this.factory.getEventManager().invokeEvent(
        FactoryEvent.FACTORY_POINTER_OUT,
        lastEvent
      );
      lastEvent = null;
    });
  
    element.addEventListener("pointermove", (e) => {
      let size = { width: 1, height: 1 };
  
      if (this.selectedComponentMetaId) {
        size = this.game.getMeta().componentsById[this.selectedComponentMetaId];
      }
  
      const rect = element.getBoundingClientRect();
      const localX = e.clientX - rect.left - (this.tileSize * size.width) / 2;
      const localY = e.clientY - rect.top - (this.tileSize * size.height) / 2;
  
      const pointerEvent = {
        x: Math.round(localX / this.tileSize),
        y: Math.round(localY / this.tileSize),
        leftDown: e.buttons === 1,
        rightDown: e.buttons === 2,
        shift: e.shiftKey,
        alt: e.altKey,
        pointerType: e.pointerType, // "mouse", "touch", "pen"
      };
  
      pointerEvent.x = Math.min(
        this.tilesX - size.width,
        Math.max(0, pointerEvent.x)
      );
      pointerEvent.y = Math.min(
        this.tilesY - size.height,
        Math.max(0, pointerEvent.y)
      );
  
      if (!lastEvent || lastEvent.x !== pointerEvent.x || lastEvent.y !== pointerEvent.y) {
        this.factory.getEventManager().invokeEvent(
          FactoryEvent.FACTORY_POINTER_MOVE,
          pointerEvent
        );
        lastEvent = pointerEvent;
      }
    });
  
    element.addEventListener("pointerdown", (e) => {
      this.factory.getEventManager().invokeEvent(
        FactoryEvent.FACTORY_POINTER_DOWN,
        {
          x: lastEvent?.x ?? 0,
          y: lastEvent?.y ?? 0,
          leftDown: e.buttons === 1,
          rightDown: e.buttons === 2,
          shift: e.shiftKey,
          alt: e.altKey,
          pointerType: e.pointerType,
        }
      );
    });
  
    element.addEventListener("pointerup", () => {
      this.factory.getEventManager().invokeEvent(
        FactoryEvent.FACTORY_POINTER_UP,
        lastEvent
      );
    });
  }
  

  destroy() {
    this.mouseInfoHelper.destroy();
    this.factory.getEventManager().removeListenerForType(LAYER_MOUSE);
    this.container.innerHTML = "";
    this.container = null;
  }
}

export default MouseLayer;
