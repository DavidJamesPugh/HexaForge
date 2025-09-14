// AreasLayer.js
import BuyAreaAction from "../../../game/action/BuyAreaAction.js";
import ConfirmUi from "../../helper/ConfirmUi.js";
import AlertUi from "../../helper/AlertUi.js";
import FactoryEvent from "/js/config/event/FactoryEvent.js"; // assuming
import numberFormat from "/js/base/NumberFormat.js"

export default class AreasLayer {
  constructor(imageMap, factory, { tileSize }) {
    this.imageMap = imageMap;
    this.factory = factory;
    this.game = factory.getGame();
    this.tileSize = tileSize;
    this.tilesX = factory.getMeta().tilesX;
    this.tilesY = factory.getMeta().tilesY;
  }

  display(container) {
    this.container = container;
    this.container.insertAdjacentHTML("afterbegin", '<div id="areasLayer" style="position:absolute"></div>');

    this.factory.getEventManager().addListener(
      "AreasLayer",
      FactoryEvent.FACTORY_COMPONENTS_CHANGED,
      () => this.redraw()
    );

    this.area = this.container.querySelector("#areasLayer");
    this.redraw();
  }

  redraw() {
    this.area.innerHTML = "";

    const meta = this.factory.getMeta();
    const areasManager = this.factory.getAreasManager();

    meta.areas.forEach(area => {
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
            position: "absolute"
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
              marginTop: `${(this.tileSize*loc.height)/2-23}px`,
              position: "absolute"
            });
            this.area.appendChild(label);
          };
        });
      }
    });

    let hovered = null;
    let scrolling = false;

    this.factory.getEventManager().addListener("AreasLayer", FactoryEvent.FACTORY_SCROLL_START, () => {
      scrolling = true;
    });

    this.factory.getEventManager().addListener("AreasLayer", FactoryEvent.FACTORY_SCROLL_END, () => {
      setTimeout(() => (scrolling = false), 100);
    });

    this.area.querySelectorAll(".mapBuyArea").forEach(el => {
      el.addEventListener("pointerover", e => {
        const id = e.currentTarget.dataset.id;
        if (hovered !== id) {
          this.area.querySelectorAll(".mapBuyArea").forEach(
            div => div.classList.remove("mapBuyAreaOver")
          );
          this.area.querySelectorAll(`.mapBuyArea[data-id="${id}"]`).forEach(
            div => div.classList.add("mapBuyAreaOver")
          );
        }
        hovered = id;
      });

      el.addEventListener("pointerout", () => {
        this.area.querySelectorAll(".mapBuyArea").forEach(div => div.classList.remove("mapBuyAreaOver"));
        hovered = null;
      });

      el.addEventListener("click", e => {
        if (scrolling) return;

        const id = e.currentTarget.dataset.id;
        const metaArea = meta.areasById[id];
        const action = new BuyAreaAction(this.factory, id);

        if (action.canBuy()){
          new ConfirmUi(
            "",
            `<center>Are you sure you want to buy this area for <br />
            <b class="money" style="font-size:1.1em">$${numberFormat.formatNumber(meta.price)}</b></center>`
          ).setOkTitle("Yes, buy").setCancelTitle("No")
          .setOkCallback(() => {
            const confirmAction = new BuyAreaAction(this.factory, id);
            if(confirmAction.canBuy()) {
              confirmAction.buy();
              this.redraw();
            }
          }).display();
        } else {
          new AlertUi("","<center>You don't have enough money to buy selected area</center>").display();
        }

      });
    });
  }

  destroy() {
    this.factory.getEventManager().removeListenerForType("AreasLayer");
    this.container.innerHTML = "";
    this.container = null;
    this.canvas = null;
  }
}
