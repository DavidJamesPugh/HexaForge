// AreasLayer.js
import BuyAreaAction from "../../../game/action/BuyAreaAction.js";
import ConfirmUi from "../../helper/ConfirmUi.js";
import AlertUi from "../../helper/AlertUi.js";
import FactoryEvent from "/js/config/event/FactoryEvent.js";
import numberFormat from "/js/base/NumberFormat.js";

export default class AreasLayer {
  constructor(imageMap, factory, { tileSize }) {
    this.imageMap = imageMap;
    this.factory = factory;
    this.game = factory.getGame();
    this.tileSize = tileSize;
    this.tilesX = factory.getMeta().tilesX;
    this.tilesY = factory.getMeta().tilesY;
    this.area = null;
    this._scrolling = false;
  }

  display(container) {
    this.container = container;
    this.container.insertAdjacentHTML(
      "beforeend",
      '<div id="areasLayer" style="position:absolute"></div>'
    );

    this.factory.getEventManager().addListener(
      "AreasLayer",
      FactoryEvent.FACTORY_COMPONENTS_CHANGED,
      () => this.redraw()
    );

    this.factory.getEventManager().addListener(
      "AreasLayer",
      FactoryEvent.FACTORY_SCROLL_START,
      () => {
        this._scrolling = true;
      }
    );

    this.factory.getEventManager().addListener(
      "AreasLayer",
      FactoryEvent.FACTORY_SCROLL_END,
      () => {
        setTimeout(() => {
          this._scrolling = false;
        }, 100);
      }
    );

    this.factory.getEventManager().addListener(
      "AreasLayer",
      FactoryEvent.ATTEMPT_AREA_PURCHASE,
      ({ x, y }) => {
        if (this._scrolling) return;
        this.tryBuyAtTile(x, y);
      }
    );

    this.factory.getEventManager().addListener(
      "AreasLayer",
      FactoryEvent.FACTORY_MOUSE_MOVE,
      (ev) => {
        if (!this.area || !ev) return;
        this.updateAreaHover(ev.x, ev.y);
      }
    );

    this.area = this.container.querySelector("#areasLayer");
    this.redraw();
  }

  /** Tile (x,y) inside an unbought unlock region → same confirm flow as legacy mapBuyArea click. */
  tryBuyAtTile(tileX, tileY) {
    const meta = this.factory.getMeta();
    const areasManager = this.factory.getAreasManager();
    let areaId = null;
    for (const area of meta.areas) {
      if (areasManager.getIsAreaBought(area.id)) continue;
      for (const loc of area.locations) {
        if (
          tileX >= loc.x &&
          tileX <= loc.x2 &&
          tileY >= loc.y &&
          tileY <= loc.y2
        ) {
          areaId = area.id;
          break;
        }
      }
      if (areaId) break;
    }
    if (!areaId) return;

    const metaArea = meta.areasById[areaId];
    const action = new BuyAreaAction(this.factory, areaId);

    if (action.canBuy()) {
      new ConfirmUi(
        "",
        `<center>Are you sure you want to buy this area for <br />
            <b class="money" style="font-size:1.1em">$${numberFormat.formatNumber(metaArea.price)}</b></center>`
      )
        .setOkTitle("Yes, buy")
        .setCancelTitle("No")
        .setOkCallback(() => {
          const confirmAction = new BuyAreaAction(this.factory, areaId);
          if (confirmAction.canBuy()) {
            confirmAction.buy();
            this.redraw();
          }
        })
        .display();
    } else {
      new AlertUi(
        "",
        "<center>You don't have enough money to buy selected area</center>"
      ).display();
    }
  }

  updateAreaHover(tileX, tileY) {
    const meta = this.factory.getMeta();
    const areasManager = this.factory.getAreasManager();
    let hoveredId = null;
    for (const area of meta.areas) {
      if (areasManager.getIsAreaBought(area.id)) continue;
      for (const loc of area.locations) {
        if (
          tileX >= loc.x &&
          tileX <= loc.x2 &&
          tileY >= loc.y &&
          tileY <= loc.y2
        ) {
          hoveredId = area.id;
          break;
        }
      }
      if (hoveredId) break;
    }
    this.area.querySelectorAll(".mapBuyArea").forEach((div) => {
      const id = div.dataset.id;
      div.classList.toggle(
        "mapBuyAreaOver",
        hoveredId !== null && id === hoveredId
      );
    });
  }

  redraw() {
    this.area.innerHTML = "";

    const meta = this.factory.getMeta();
    const areasManager = this.factory.getAreasManager();

    meta.areas.forEach((area) => {
      if (!areasManager.getIsAreaBought(area.id)) {
        area.locations.forEach((loc, index) => {
          const rect = document.createElement("div");
          rect.className = "mapBuyArea";
          rect.dataset.id = area.id;

          Object.assign(rect.style, {
            left: `${this.tileSize * loc.x}px`,
            top: `${this.tileSize * loc.y}px`,
            width: `${this.tileSize * loc.width}px`,
            height: `${this.tileSize * loc.height}px`,
            position: "absolute",
          });

          this.area.appendChild(rect);

          if (index === 0) {
            const label = document.createElement("div");
            label.className = "mapBuyAreaTitle money";
            label.innerHTML = `
            ${area.name}<br />
            Buy for <br />
            <b>$${numberFormat.formatNumber(area.price)}`;
            Object.assign(label.style, {
              left: `${this.tileSize * loc.x}px`,
              top: `${this.tileSize * loc.y}px`,
              width: `${this.tileSize * loc.width}px`,
              marginTop: `${(this.tileSize * loc.height) / 2 - 23}px`,
              position: "absolute",
            });
            this.area.appendChild(label);
          }
        });
      }
    });
  }

  destroy() {
    this.factory.getEventManager().removeListenerForType("AreasLayer");
    this.container.innerHTML = "";
    this.container = null;
    this.area = null;
  }
}
