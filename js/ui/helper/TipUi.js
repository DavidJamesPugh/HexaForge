// src/ui/helper/TipUi.js
import Handlebars from "handlebars";
import tipTemplate from "../../template/helper/tip.html";

let tipCounter = 0;

class TipUi {
  constructor(initElement, contentOrElement) {
    this.initElement = initElement;
    if (typeof contentOrElement === "string") {
      this.content = contentOrElement;
    } else {
      this.element = contentOrElement;
    }
    this.isVisible = false;
  }

  init() {
    if (!this.element) {
      this.id = "tip" + tipCounter++;
      const body = $("body");
      body.append(
        Handlebars.compile(tipTemplate)({ id: this.id, content: this.content })
      );
      this.element = body.find("#" + this.id);
    }

    this.element.css("position", "absolute").hide();

    this.mouseMove = (e) => {
      this.updateLocation(e);
      this.display();
    };

    this.mouseOut = () => {
      this.hide();
    };

    this.initElement
      .bind("mousemove", this.mouseMove)
      .bind("mouseout", this.mouseOut);

    return this;
  }

  destroy() {
    this.hide();
    this.initElement
      .unbind("mousemove", this.mouseMove)
      .unbind("mouseout", this.mouseOut);
    return this;
  }

  display() {
    if (!this.isVisible) {
      this.isVisible = true;
      this.element.fadeIn(200);
    }
  }

  updateLocation(e) {
    const w = this.element.width();
    const h = this.element.height();
    let left = e.pageX - w / 2;
    let top = e.pageY + 15;

    const winWidth = $(window).width();
    const winHeight = $(window).height();
    const scrollX = $(window).scrollLeft();
    const scrollY = $(window).scrollTop();

    if (left - scrollX < 10) left = scrollX + 10;
    if (left + w - scrollX > winWidth - 20) left = winWidth + scrollX - w - 20;
    if (top + h - scrollY > winHeight - 20) top = e.pageY - h - 20;

    this.element.css("left", left).css("top", top);
  }

  hide() {
    if (this.isVisible) {
      this.element.finish().fadeOut(200);
      this.isVisible = false;
    }
  }
}

export default TipUi;
