
import FactoryEvent from "/js/config/event/FactoryEvent.js"; // assuming

export default class BackgroundLayer {
    constructor(imageMap, factory, options) {
      this.imageMap = imageMap;
      this.factory = factory;
      this.tileSize = options.tileSize;
      this.tilesX = factory.getMeta().tilesX;
      this.tilesY = factory.getMeta().tilesY;
      this.game = factory.getGame();
      this.shouldDrawBuildableAreas = false;
    }
  
    display(container) {
      this.container = container;
      this.canvas = document.createElement("canvas");
      this.canvas.style.position = "absolute";
      this.canvas.width = this.tilesX * this.tileSize;
      this.canvas.height = this.tilesY * this.tileSize;
  
      container.append(this.canvas);
      this.sprite = this.imageMap.getImage("terrains");
  
      this.redraw();
  
      const eventManager = this.factory.getEventManager();
      eventManager.addListener("LayerBackground", FactoryEvent.TILE_TYPE_CHANGED, () => this.redraw());
  
      eventManager.addListener("LayerBackground", FactoryEvent.MAP_TOOL_SELECTED, (tool) => {
        this.shouldDrawBuildableAreas = !!tool;
        this.redraw();
      });
    }
  
    getCanvas() {
      return this.canvas;
    }
  
    redraw() {
      const ctx = this.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      const terrainMap = {
        undefined: { y: 0, tiles: 6 },
        grass: { y: 0, tiles: 6 },
        floor: { y: 1, tiles: 6 },
        wall: { y: 1, tiles: 6 },
        road: { y: 0, tiles: 6 },
      };
  
      this.drawTerrain(ctx, terrainMap);
  
      for (const tile of this.factory.getTiles()) {
        switch (tile.getTerrain()) {
          case "wall":
            this.drawTerrainBorders(ctx, tile, 7, 1, { grass: true, road: true });
            this.drawTerrainBorders(ctx, tile, 10, 6, { floor: true, grass: true, road: true});
            break;
          case "floor":
            this.drawTerrainBorders(ctx, tile, 7, 1, { grass: true, road: true });
            break;
          case "road":
            this.drawRoad(ctx, tile, 2, { road: true });
            break;
        }
      }
  
      if (this.shouldDrawBuildableAreas) {
        this.drawBuildableAreas();
      }
    }
  
    drawBuildableAreas() {
      const ctx = this.canvas.getContext("2d");
      const typeMap = { " ": "greenSelection", "-": "yellowSelection", X: "redSelection" };
  
      for (const tile of this.factory.getTiles()) {
        const img = this.imageMap.getImage(typeMap[tile.getBuildableType()]);
        const x = tile.getX() * this.tileSize;
        const y = tile.getY() * this.tileSize;
        ctx.drawImage(img, x, y, this.tileSize, this.tileSize);
      }
    }
  
    drawTerrain(ctx, terrainMap) {
      for (const tile of this.factory.getTiles()) {
        const x = tile.getX() * this.tileSize;
        const y = tile.getY() * this.tileSize;
        const terrain = terrainMap[tile.getTerrain()];
        
        const seed = (tile.getX() * 73893) ^ (tile.getY() * 19349663);
        const variation = Math.abs(seed) % terrain.tiles;
        const sx = variation * (this.tileSize + 1);
        const sy = terrain.y * (this.tileSize + 1);
  
        ctx.drawImage(this.sprite, 
          sx, sy, 
          this.tileSize, this.tileSize, 
          x, y, 
          this.tileSize, this.tileSize);
      }
    }
  
    drawTerrainBorders(ctx, tile, n, i, allowed) {
      const d = this.tileSize;
      const g = d + 1;
      const m = tile.getX() * this.tileSize;
      const f = tile.getY() * this.tileSize;
      const X = n * g;
      const y = (n + 1) * g;
      const v = (n + 2) * g;
      const seed = (tile.getX() * 73893) ^ (tile.getY() * 19349663);
      const rand = Math.abs(Math.floor((seed % i)) * g);

      const has = dir => {
        const t = tile.getTileInDirection(dir);
        return !t || allowed[t.getTerrain()];
      };
  
      const top = has("top"), right = has("right"), bottom = has("bottom"), left = has("left");
      const tr = has("top_right"), tl = has("top_left"), br = has("bottom_right"), bl = has("bottom_left");
  
      if (top && right) ctx.drawImage(this.sprite, 3 * g + 10, v, 11, 11, m + 10, f, 11, 11);
      if (top && left) ctx.drawImage(this.sprite, 3 * g, v, 11, 11, m, f, 11, 11);
      if (bottom && right) ctx.drawImage(this.sprite, 3 * g + 10, v + 10, 11, 11, m + 10, f + 10, 11, 11);
      if (bottom && left) ctx.drawImage(this.sprite, 3 * g, v + 10, 11, 11, m, f + 10, 11, 11);
      
      if (tr && !top && !right) ctx.drawImage(this.sprite, 0 * g + 10, v, 11, 11, m + 10, f, 11, 11);
      if (tl && !top && !left) ctx.drawImage(this.sprite, 0 * g, v, 11, 11, m, f, 11, 11);
      if (br && !bottom && !right) ctx.drawImage(this.sprite, 0 * g + 10, v + 10, 11, 11, m + 10, f + 10, 11, 11);
      if (bl && !bottom && !left) ctx.drawImage(this.sprite, 0 * g, v + 10, 11, 11, m, f + 10, 11, 11);
  
      const b = left ? 10 : 0;
      const S = right ? 10 : 0;
      const G = top ? 10 : 0;
      const T = bottom ? 10 : 0;
  
       if (top) ctx.drawImage(this.sprite, 
        rand + b, X, 
        d - b - S, 11, 
        m + b, f, 
        d - b - S, 11);
       if (bottom) ctx.drawImage(this.sprite, rand + b, X + 10, d - b - S, 11, m + b, f + 10, d - b - S, 11);
       if (right) ctx.drawImage(this.sprite, rand + 10, y + G, 11, d - G - T, m + 10, f + G, 11, d - G - T);
       if (left) ctx.drawImage(this.sprite, rand, y + G, 11, d - G - T, m, f + G, 11, d - G - T);
    }
  
    drawRoad(ctx, tile, n, allowed) {
      const has = dir => {
        const t = tile.getTileInDirection(dir);
        return !t || allowed[t.getTerrain()];
      };
  
      const key = `${has("top") ? "1" : "0"}${has("right") ? "1" : "0"}${has("bottom") ? "1" : "0"}${has("left") ? "1" : "0"}`;
  
      const map = {
        "0000": [0, 0], "1000": [1, 0], "0100": [2, 0], "0010": [3, 0], "0001": [4, 0],
        "1010": [0, 1], "0101": [0, 2], "1100": [0, 3], "0110": [1, 3],
        "0011": [2, 3], "1001": [3, 3], "1111": [4, 4], "1110": [0, 4],
        "0111": [1, 4], "1011": [2, 4], "1101": [3, 4],
      };
  
      const [sx, sy] = map[key];
      ctx.drawImage(
        this.sprite,
        sx * (this.tileSize + 1), (n + sy) * (this.tileSize + 1),
        this.tileSize, this.tileSize,
        tile.getX() * this.tileSize, tile.getY() * this.tileSize,
        this.tileSize, this.tileSize
      );
    }
  
    destroy() {
      this.factory.getEventManager().removeListenerForType("LayerBackground");
      if (this.container) {
        this.container.innerHTML = "";
        this.container = null;
      }
    }
  }
  