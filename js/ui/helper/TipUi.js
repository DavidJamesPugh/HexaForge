// src/ui/helper/TipUi.js
import Handlebars from "handlebars";
import tipTemplate from "../../template/helper/tip.html?raw";

let tipCounter = 0;

class TipUi {
  constructor(initElement, contentOrElement) {
    this.initElement = initElement;
    this.content = typeof contentOrElement === "string" ? contentOrElement : null;
    this.element = typeof contentOrElement !== "string" ? contentOrElement : null;
    this.isVisible = false;

    this.mouseMove = (e) => {
      this.updateLocation(e);
      this.display();
    };

    this.mouseOut = () => {
      this.hide();
    };
  }

  init() {
    if (!this.element) {
      this.id = `tip${tipCounter++}`;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = Handlebars.compile(tipTemplate)({ id: this.id, content: this.content });
      this.element = wrapper.firstElementChild;
      document.body.appendChild(this.element);
    }

    Object.assign(this.element.style, {
      position: "absolute",
      display: "none",
    });

    this.initElement.addEventListener("mousemove", this.mouseMove);
    this.initElement.addEventListener("mouseout", this.mouseOut);

    return this;
  }

  destroy() {
    this.hide();
    this.initElement.removeEventListener("mousemove", this.mouseMove);
    this.initElement.removeEventListener("mouseout", this.mouseOut);
    return this;
  }

  display() {
    if (!this.isVisible) {
      this.isVisible = true;
      this.element.style.display = "block";
      this.element.style.opacity = "1"; // could animate via CSS
    }
  }

  updateLocation(e) {
    const rect = this.element.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    let left = e.pageX - w / 2;
    let top = e.pageY + 15;

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (left - scrollX < 10) left = scrollX + 10;
    if (left + w - scrollX > winWidth - 20) left = winWidth + scrollX - w - 20;
    if (top + h - scrollY > winHeight - 20) top = e.pageY - h - 20;

    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
  }

  hide() {
    if (this.isVisible) {
      this.element.style.display = "none";
      this.isVisible = false;
    }
  }
}

export default TipUi;
