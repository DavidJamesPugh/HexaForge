import Main from "./Main.js";
import MainSingleton from "./MainSingleton.js";

const loader = {
  messageEl: document.getElementById("loadingMessage"),
  bgEl: document.getElementById("initialLoaderBg"),
  loaderEl: document.getElementById("initialLoader"),

  showMessage(msg) {
    if (this.messageEl) this.messageEl.innerHTML = msg;
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
    
    await MainSingleton.init(false);

    loader.hide();
    console.log("✅ Game initialized successfully!");
  } catch (err) {
    console.error("❌ Game failed to start:", err);
    loader.showMessage(
      "Failed to load game modules. Check console for details."
    );
  }
});
