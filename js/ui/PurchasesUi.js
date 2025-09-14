import Handlebars from "handlebars";
import purchasesTemplateHtml from "../template/purchases.html";
import UrlHandler from "../play/UrlHandler.js";
import GameUiEvent from "../config/event/GameEvent.js";
import GameContext from "../base/GameContext.js";

export default class PurchasesUi {
    constructor(play) {
        this.gameUiEm = GameContext.gameUiBus;
        this.play = play;
        this.purchasesManager = this.play.getPurchasesManager();
        this.bg = null;
        this.element = null;
    }

    init() {
        // Listen for SHOW_PURCHASES event
        this.gameUiEm.addListener("purchases", GameUiEvent.SHOW_PURCHASES, () => {
            this.display();
        });
        return this;
    }

    display() {
        const site = UrlHandler.identifySite();
        const meta = this.play.getMeta();

        // Base context
        const context = {
            mainSiteVersion: site === "localhost" || site === "direct"
        };

        // Build product sections
        for (const sectionKey in meta.productsLayout) {
            const section = meta.productsLayout[sectionKey];
            context[sectionKey] = [];

            for (const productId of section) {
                const product = meta.productsById[productId];
                if (this.purchasesManager.isVisible(product.id)) {
                    context[sectionKey].push({
                        isItem: true,
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        priceStr: product.priceStr[this.purchasesManager.getPriceKey()],
                        isBought: this.purchasesManager.getIsUnlocked(product.id)
                    });
                }
            }
        }

        document.body.insertAdjacentHTML('beforeend', Handlebars.compile(purchasesTemplateHtml)(context));
        this.bg = document.getElementById("purchasesBg");
        this.element = document.getElementById("purchases");

        // Center UI horizontally
        this.element.style.left = `${(document.documentElement.offsetWidth - this.element.offsetWidth) / 2}px`;

        // Events
        this.element.querySelector(".closeButton").addEventListener("click", () => this.hide());

        this.element.querySelectorAll(".item").forEach(el => {
            el.addEventListener("click", (ev) => {
            const productId = ev.currentTarget.getAttribute("data-id");
            if (!this.purchasesManager.getIsUnlocked(productId)) {
                this.purchasesManager.startPurchase(productId, () => {
                    this.hide();
                    this.display(); // re-render updated purchases
                });
            }
            });
        });

        this.bg.addEventListener("click", () => this.hide());
    }

    hide() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        if (this.bg) {
            this.bg.remove();
            this.bg = null;
        }
    }

    destroy() {
        this.hide();
        this.gameUiEm.removeListenerForType("purchases");
    }
}
