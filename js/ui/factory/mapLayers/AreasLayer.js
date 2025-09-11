// AreasLayer.js
import BuyAreaAction from "../../../game/action/BuyAreaAction.js";
import ConfirmUi from "../../helper/ConfirmUi.js";
import AlertUi from "../../helper/AlertUi.js";

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
    this.container.append('<div id="areasLayer" style="position:absolute"></div>');

    this.factory.getEventManager().addListener(
      "AreasLayer",
      FactoryEvent.FACTORY_COMPONENTS_CHANGED,
      () => this.redraw()
    );

    this.area = this.container.find("#areasLayer");
    this.redraw();
  }

  redraw() {
    this.area.html("");

    this.factory.getMeta().areas.forEach(area => {
      if (!this.factory.getAreasManager().getIsAreaBought(area.id)) {
        for (const [index, loc] of area.locations.entries()) {
          const rect = $(`<div class="mapBuyArea" data-id="${area.id}"></div>`)
            .css({
              left: this.tileSize * loc.x,
              top: this.tileSize * loc.y,
              width: this.tileSize * loc.width,
              height: this.tileSize * loc.height,
            });

          let label = "";
          if (index === 0) {
            label = $(
              `<div class="mapBuyAreaTitle money">
                ${area.name}<br />Buy for <br /><b>$${nf(area.price)}</b>
               </div>`
            ).css({
              left: this.tileSize * loc.x,
              top: this.tileSize * loc.y,
              width: this.tileSize * loc.width,
              marginTop: (this.tileSize * loc.height) / 2 - 23,
            });
          }

          this.area.append(rect).append(label);
        }
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

    this.area.find(".mapBuyArea")
      .on("mouseover", e => {
        const id = $(e.currentTarget).attr("data-id");
        if (hovered !== id) {
          this.area.find(".mapBuyArea").removeClass("mapBuyAreaOver");
          this.area.find(`.mapBuyArea[data-id='${id}']`).addClass("mapBuyAreaOver");
        }
        hovered = id;
      })
      .on("mouseout", () => {
        this.area.find(".mapBuyArea").removeClass("mapBuyAreaOver");
        hovered = null;
      })
      .on("click", e => {
        if (scrolling) return;

        const id = $(e.currentTarget).attr("data-id");
        const meta = this.factory.getMeta().areasById[id];
        const action = new BuyAreaAction(this.factory, id);

        if (action.canBuy()) {
          new ConfirmUi(
            "",
            `<center>Are you sure you want to buy this area for <br />
              <b class="money" style="font-size:1.1em">$${nf(meta.price)}</b></center>`
          )
            .setOkTitle("Yes, buy")
            .setCancelTitle("No")
            .setOkCallback(() => {
              const confirmAction = new BuyAreaAction(this.factory, id);
              if (confirmAction.canBuy()) {
                confirmAction.buy();
                this.redraw();
              }
            })
            .display();
        } else {
          new AlertUi("", "<center>You don't have enough money to buy selected area</center>").display();
        }
      });
  }

  destroy() {
    this.factory.getEventManager().removeListenerForType("AreasLayer");
    this.container.html("");
    this.container = null;
    this.canvas = null;
  }
}
