import Handlebars from "handlebars";
import confirmTemplateHtml from "../../template/helper/confirm.html?raw";

let confirmCounter = 0;

export default class ConfirmUi {
  title;
  message;
  okTitle = "Ok";
  cancelTitle = "Cancel";
  okCallback;
  cancelCallback;
  element;
  bg;

  constructor(title, message) {
    this.title = title;
    this.message = message;
    this.id = `confirm${confirmCounter++}`;
    this.idBg = `${this.id}Bg`;
  }

  setOkTitle(title) {
    this.okTitle = title;
    return this;
  }

  setCancelTitle(title) {
    this.cancelTitle = title;
    return this;
  }

  setOkCallback(callback) {
    this.okCallback = callback;
    return this;
  }

  setCancelCallback(callback) {
    this.cancelCallback = callback;
    return this;
  }

  display() {
    // Inject HTML
    const html = Handlebars.compile(confirmTemplateHtml)({
      id: this.id,
      idBg: this.idBg,
      title: this.title,
      message: this.message,
      okTitle: this.okTitle,
      cancelTitle: this.cancelTitle,
    });

    document.body.insertAdjacentHTML("beforeend", html);

    this.element = document.getElementById(this.id);
    this.bg = document.getElementById(this.idBg);

    if (!this.element || !this.bg) return this;

    // Center the modal
    const centerModal = () => {
      const { innerWidth: w, innerHeight: h } = window;
      const { offsetWidth: ew, offsetHeight: eh } = this.element;
      this.element.style.left = `${Math.round((w - ew) / 2)}px`;
      this.element.style.top = `${Math.round((h - eh) / 2)}px`;
    };
    centerModal();
    window.addEventListener("resize", centerModal);

    // Button handlers
    this.element.querySelector(".okButton")?.addEventListener("click", () => {
      this.hide();
      this.okCallback?.();
    });

    this.element.querySelector(".cancelButton")?.addEventListener("click", () => {
      this.hide();
      this.cancelCallback?.();
    });

    // Fade in
    this.bg.style.opacity = 0;
    this.element.style.opacity = 0;
    this.bg.style.display = "block";
    this.element.style.display = "block";

    requestAnimationFrame(() => {
      this.bg.style.transition = "opacity 0.2s ease";
      this.element.style.transition = "opacity 0.2s ease";
      this.bg.style.opacity = 1;
      this.element.style.opacity = 1;
    });

    return this;
  }

  hide() {
    if (this.element && this.bg) {
      const fadeOut = el => {
        el.style.transition = "opacity 0.2s ease";
        el.style.opacity = 0;
        el.addEventListener("transitionend", () => el.remove(), { once: true });
      };
      fadeOut(this.element);
      fadeOut(this.bg);
    }
  }
}
