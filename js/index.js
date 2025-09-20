import MainSingleton from "./MainSingleton.js";

const loader = {
  get messageEl() { return document.getElementById("loadingMessage"); },
  get bgEl() { return document.getElementById("initialLoaderBg"); },
  get loaderEl() { return document.getElementById("initialLoader"); },

  showMessage(msg) {
    if (this.messageEl) this.messageEl.textContent = msg;
  },
  hide() {
    if (this.loaderEl) this.loaderEl.style.display = "none";
    if (this.bgEl) this.bgEl.style.display = "none";
  }
};

function isBrowserSupported() {
  const canvas = document.createElement("canvas");
  return canvas.getContext && canvas.getContext("2d");
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    if (!isBrowserSupported()) {
      loader.showMessage(
        "⚠️ Your browser is too old and does not support canvas. Please update!"
      );
      return;
    }

    loader.showMessage("Loading game… please wait…");
    await MainSingleton.init(true);

    loader.hide();
    console.log("✅ Game initialized successfully!");
    
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  } catch (err) {
    console.error("❌ Game failed to start:", err);
    loader.showMessage(
      "Failed to load game modules. Check console for details."
    );
  }
});
