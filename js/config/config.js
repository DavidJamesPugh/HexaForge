// config.js - central game config
import mainModule from "./main/main.js";

export default {
  userHash: { key: "FactoryIdleUserHash" },
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
    local: { storageKey: "FactoryIdleLocal" }
  },
  saveManager: {
    cloudSaveIntervalMs: 900000, // 15 min
    localSaveIntervalMs: 5000
  },
  main: {
    ...mainModule,
    warnToStoreUserHashAfterTicks: {
      10000: true,
      100000: true,
      1000000: true
    }
  }
};
