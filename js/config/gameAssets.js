// config/gameAssets.js
import ImageMap from "../base/ImageMap.js";
import gameConfig from "./config.js";

const imageMap = new ImageMap(gameConfig.imageMap.path).addImages({
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
});

// The loadAllAsync method is already available from the ImageMap class

export default imageMap;