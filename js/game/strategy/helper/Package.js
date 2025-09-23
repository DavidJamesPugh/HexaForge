let pool = [];

export default class Package {
  constructor(resourceId, amount, factory) {
    if (!factory) throw new Error("Missing argument factory");
    this.resourceId = resourceId;
    this.meta = factory.getGame().getMeta().resourcesById[resourceId];
    this.offset = Math.round(4 * Math.random()) - 2;
    this.amount = amount;
  }

  static getNew(resourceId, amount, factory) {
    return pool.length > 0 ? pool.pop() : new Package(resourceId, amount, factory);
  }

  static free(pkg) {
    pool.push(pkg);
  }

  getResourceId() {
    return this.resourceId;
  }

  getResourceIdNum() {
    return this.meta.idNum;
  }

  getOffset() {
    return this.offset;
  }

  getAmount() {
    return this.amount;
  }

  toString() {
    return this.resourceId;
  }

  static staticExportData(pkg, writer) {
    if (pkg) {
      writer.writeUint8(pkg.getResourceIdNum());
      writer.writeUint8(pkg.getAmount());
    } else {
      writer.writeUint8(0);
    }
  }

  static createFromExport(factory, reader, version) {
    const resourceIdNum = reader.readUint8();
    if (resourceIdNum === 0) return null;

    const ver = version === undefined ? 6 : Number(version);
    const amount = ver >= 6 ? reader.readUint8() : 1;
    const resourceMeta = factory.getGame().getMeta().resourcesByIdNum[resourceIdNum];
    return resourceMeta ? Package.getNew(resourceMeta.id, amount, factory) : null;
  }
}
