export default class ResourceIntake {
    constructor(component, inputResources) {
      this.component = component;
      this.inputResources = inputResources;
      this.reset();
    }
  
    reset() {
      this.resources = {};
      this.inputTileIndex = [];
      for (const res in this.inputResources) {
        this.resources[res] = 0;
        this.inputTileIndex.push({ resource: res, offset: 0 });
      }
    }
  
    updateWithDescriptionData(desc) {
      if (!desc.stock) desc.stock = [];
      const resourcesMeta = this.component.getFactory().getGame().getMeta().resourcesById;
  
      for (const res in this.inputResources) {
        const inputMeta = this.inputResources[res];
        let allowed = true;
        if (inputMeta.requiresResearch) {
          allowed = this.component.getFactory().getGame().getResearchManager().getResearch(inputMeta.requiresResearch) > 0;
        }
        if (allowed) {
          const resMeta = resourcesMeta[res];
          if (!resMeta) continue;
          desc.stock.push({
            resourceId: res,
            resourceName: resMeta.nameShort,
            amount: this.resources[res],
            max: this.getMax(res),
          });
        }
      }
    }
  
    getMax(res) {
      const input = this.inputResources?.[res];
      if (!input) return 0;
      const meta = this.component.getMeta();
      const bonuses = this.component.getFactory().getUpgradesManager().getComponentBonuses(meta.applyUpgradesFrom ?? meta.id);
      const cap =
        input.max != null && input.max > 0
          ? input.max
          : input.perOutputResource != null
            ? 20 * input.perOutputResource
            : 1e6;
      return cap * bonuses.maxStorageBonus;
    }
  
    takeIn() {
      const tiles = this.component.getSurroundedInputTiles();
      for (const idx of this.inputTileIndex) {
        const res = idx.resource;
        let offset = idx.offset;
  
        for (let i = 0; i < tiles.length && this.resources[res] < this.getMax(res); i++) {
          const tile = tiles[(offset + i) % tiles.length];
          const srcTile = tile.tile;
          const strat = srcTile.getComponent().getStrategy();
          const outputQ =
            strat.getDirectOutputQueue?.(srcTile, tile.direction) ??
            strat.getOutputQueue?.(tile.direction);
          if (!outputQ) continue;
          const last = outputQ.getLast();
          if (last && last.getResourceId() === res) {
            outputQ.unsetLast();
            offset = (offset + i + 1) % tiles.length;
            this.resources[res] += last.getAmount();
          }
        }
  
        idx.offset = offset;
      }
  
      for (const tile of tiles) {
        const srcTile = tile.tile;
        const strat = srcTile.getComponent().getStrategy();
        const q =
          strat.getDirectOutputQueue?.(srcTile, tile.direction) ??
          strat.getOutputQueue?.(tile.direction);
        if (q) q.forward();
      }
    }
  
    addResource(res, amount) {
      this.resources[res] += amount;
    }
  
    getResource(res) {
      return this.resources[res];
    }
  
    toString() {
      let str = "IN<br />";
      for (const idx of this.inputTileIndex) {
        str += `${idx.resource}: ${this.resources[idx.resource]} (offset:${idx.offset})<br />`;
      }
      return str;
    }
  
    exportToWriter(writer) {
      writer.writeUint8(this.inputTileIndex.length);
      for (const idx of this.inputTileIndex) {
        writer.writeUint32(this.resources[idx.resource]);
        writer.writeUint8(idx.offset);
      }
    }
  
    importFromReader(reader) {
      const count = Math.min(this.inputTileIndex.length, reader.readUint8());
      for (let i = 0; i < count; i++) {
        this.resources[this.inputTileIndex[i].resource] = reader.readUint32();
        this.inputTileIndex[i].offset = reader.readUint8();
      }
    }
  }
  