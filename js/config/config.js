// config.js - central game config
import Meta from "./Meta.js";
import TransportTuning from "./balance/TransportTuning.js";

export default {
  userHash: { key: "HexaForgeUserHash" },
  imageMap: { path: "img/",
    files: {
      yellowSelection: "mouse/yellow.png",
      greenSelection: "mouse/green.png",
      redSelection: "mouse/red.png",
      blueSelection: "mouse/selected.png",
      cantPlace: "mouse/cantPlace.png",
      terrains: "terrains.png",
      components: "components.png",
      componentIcons: "componentIcons.png",
      transportLine: "transportLine.png",
      resources: "resources.png",
    } },
  api: {
    server: { url: "/api/games" },
    armorGames: { gameKey: "" },
    local: { storageKey: "HexaForgeLocal" }
  },
  saveManager: {
    cloudSaveIntervalMs: 900000, // 15 min
    localSaveIntervalMs: 5000
  },
  meta: {
    ...Meta,
    transportTuning: TransportTuning,
    warnToStoreUserHashAfterTicks: {
      10000: true,
      100000: true,
      1000000: true
    }
  }
};
