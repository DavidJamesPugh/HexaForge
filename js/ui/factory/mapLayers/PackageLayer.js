import FactoryEvent from "/js/config/event/FactoryEvent.js"; // assuming

export default class PackageLayer {
    constructor(imageMap, factory, options) {
      this.imageMap = imageMap;
      this.factory = factory;
      this.game = factory.getGame();
      this.tileSize = options.tileSize;
      this.packageSize = 15;
      const offset = this.packageSize / 3;
  
      this.tilesX = factory.getMeta().tilesX;
      this.tilesY = factory.getMeta().tilesY;
      this.resourcesMeta = this.factory.getGame().getMeta().resourcesById;
  
      this.firstPackageLocation = {
        top: { top: -this.packageSize + offset, bottom: -this.tileSize / 2 - offset },
        bottom: { top: this.tileSize / 2 - this.packageSize + offset, bottom: -offset },
        right: { right: -offset, left: this.tileSize / 2 - this.packageSize + offset },
        left: { right: -this.tileSize / 2 - offset, left: -this.packageSize + offset },
      };
  
      this.movementDirectionCoefficient = {
        top: { top: -5, bottom: 5 },
        bottom: { top: -5, bottom: 5 },
        right: { right: 5, left: -5 },
        left: { right: 5, left: -5 },
      };
  
      this.canvas = null;
      this.queuesCache = [];
    }
  
    getCanvas() {
      return this.canvas;
    }
  
    display(container) {
      this.container = container;
      this.canvas = document.createElement("canvas");
      this.canvas.style.position = "absolute";
      this.canvas.width = this.tilesX * this.tileSize;
      this.canvas.height = this.tilesY * this.tileSize;
      container.append(this.canvas);
  
      this.factory.getEventManager().addListener(
        "LayerPackage",
        FactoryEvent.FACTORY_TICK,
        () => {
          if (this.game.getTicker().getIsFocused()) {
            this.redraw();
          }
        }
      );
  
      this.factory.getEventManager().addListener(
        "LayerPackage",
        FactoryEvent.FACTORY_COMPONENTS_CHANGED,
        () => {
          this.buildCache();
          this.redraw();
        }
      );
  
      this.buildCache();
      this.redraw();
    }
  
    buildCache() {
      this.queuesCache = [];
      const tiles = this.factory.getTiles();
  
      for (const tile of tiles) {
        const component = tile.getComponent();
        if (component && component.getMeta().strategy.type === "transport") {
          const strategy = component.getStrategy();
          const inputs = strategy.getInputQueues();
          const outputs = strategy.getOutputQueues();
  
          this._addQueueToCache(tile, inputs.top, "top", "bottom");
          this._addQueueToCache(tile, outputs.top, "top", "top");
          this._addQueueToCache(tile, outputs.left, "left", "left");
          this._addQueueToCache(tile, inputs.left, "left", "right");
          this._addQueueToCache(tile, inputs.right, "right", "left");
          this._addQueueToCache(tile, outputs.right, "right", "right");
          this._addQueueToCache(tile, outputs.bottom, "bottom", "bottom");
          this._addQueueToCache(tile, inputs.bottom, "bottom", "top");
        }
      }
    }
  
    _addQueueToCache(tile, queue, posDir, moveDir) {
      if (queue) {
        this.queuesCache.push({ tile, queue, posDir, moveDir });
      }
    }
  
    redraw() {
      const ctx = this.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      for (const entry of this.queuesCache) {
        this.drawQueue(entry.tile, entry.queue, entry.posDir, entry.moveDir);
      }
    }
  
    drawQueue(tile, queue, posDir, moveDir) {
      const ctx = this.canvas.getContext("2d");
      const baseX = tile.getX() * this.tileSize + this.tileSize / 2;
      const baseY = tile.getY() * this.tileSize + this.tileSize / 2;
  
      for (let h = 0; h < queue.getLength(); h++) {
        let index = h;
        if (moveDir === "top" || moveDir === "left") {
          index = queue.getLength() - h - 1;
        }
  
        const pkg = queue.get(index);
        if (!pkg) continue;
  
        const resourceMeta = this.resourcesMeta[pkg.getResourceId()];
        const spriteX = resourceMeta.spriteX * (this.packageSize + 1);
        const spriteY = resourceMeta.spriteY * (this.packageSize + 1);
  
        let drawX, drawY;
        if (posDir === "left" || posDir === "right") {
          drawX = baseX + this.firstPackageLocation[posDir][moveDir] + this.movementDirectionCoefficient[posDir][moveDir] * h + pkg.getOffset() / 2;
          drawY = baseY - this.packageSize / 2 + pkg.getOffset();
        } else {
          drawX = baseX - this.packageSize / 2 + pkg.getOffset();
          drawY = baseY + this.firstPackageLocation[posDir][moveDir] + this.movementDirectionCoefficient[posDir][moveDir] * h + pkg.getOffset() / 2;
        }
  
        ctx.drawImage(
          this.imageMap.getImage("resources"),
          spriteX,
          spriteY,
          this.packageSize,
          this.packageSize,
          Math.round(drawX) + 2,
          Math.round(drawY) + 2,
          this.packageSize - 4,
          this.packageSize - 4
        );
      }
    }
  
    destroy() {
      this.factory.getEventManager().removeListenerForType("LayerPackage");
      this.container.html("");
      this.container = null;
      this.canvas = null;
    }
  }
  