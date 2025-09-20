import Handlebars from "handlebars";
import alertTemplateHtml from "../../template/helper/alert.html?raw";

let alertCounter = 0;

export default class AlertUi {
  constructor(title, message) {
    this.title = title;
    this.message = message;
    this.buttonTitle = "OK";
    this.id = `alert${alertCounter++}`;
    this.idBg = `${this.id}Bg`;
    this.container = document.body;
    this.element = null;
    this.bg = null;
    this.callback = null;
  }

  setButtonTitle(title) {
    this.buttonTitle = title;
    return this;
  }

  setCallback(callback) {
    this.callback = callback;
    return this;
  }

  display() {
    // Insert HTML
    this.container.insertAdjacentHTML(
      "beforeend",
      Handlebars.compile(alertTemplateHtml)({
        id: this.id,
        idBg: this.idBg,
        title: this.title,
        message: this.message,
        buttonTitle: this.buttonTitle,
      })
    );

    this.element = document.getElementById(this.id);
    this.bg = document.getElementById(this.idBg);

    // Center the modal
    const top = Math.round((window.innerHeight - this.element.offsetHeight) / 2);
    const left = Math.round((window.innerWidth - this.element.offsetWidth) / 2);
    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;

    // Setup button click
    const button = this.element.querySelector(".button");
    if (button) {
      button.addEventListener("click", () => {
        this.hide();
        if (this.callback) this.callback();
      });
    }

    // Fade in
    this.bg.style.opacity = 0;
    this.bg.style.transition = "opacity 0.2s ease";
    this.bg.style.display = "block";
    requestAnimationFrame(() => (this.bg.style.opacity = 1));

    this.element.style.opacity = 0;
    this.element.style.transition = "opacity 0.2s ease";
    this.element.style.display = "block";
    requestAnimationFrame(() => (this.element.style.opacity = 1));

    return this;
  }

  hide() {
    if (this.element) {
      this.element.style.opacity = 0;
      this.element.addEventListener(
        "transitionend",
        () => this.element?.remove(),
        { once: true }
      );
    }
    if (this.bg) {
      this.bg.style.opacity = 0;
      this.bg.addEventListener(
        "transitionend",
        () => this.bg?.remove(),
        { once: true }
      );
    }
  }
}
