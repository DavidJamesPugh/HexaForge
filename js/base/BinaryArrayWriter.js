import BinaryBoolean from "./BinaryBoolean.js";

export default class BinaryArrayWriter {
  constructor() {
    this.data = [];
    this.totalLength = 0;
  }

  _write(value, byteLength, method) {
    this.data.push({ value, length: byteLength, method });
    this.totalLength += byteLength;
    return this;
  }

  writeInt8(value) { return this._write(value, 1, "setInt8"); }
  writeInt16(value) { return this._write(value, 2, "setInt16"); }
  writeInt32(value) { return this._write(value, 4, "setInt32"); }

  writeUint8(value) { return this._write(value, 1, "setUint8"); }
  writeUint16(value) { return this._write(value, 2, "setUint16"); }
  writeUint32(value) { return this._write(value, 4, "setUint32"); }

  writeFloat64(value) { return this._write(value, 8, "setFloat64"); }
  writeChar(value) { return this.writeUint8(value.charCodeAt(0)); }

  writeBooleanMap(binaryBoolean) {
    return this.writeUint8(binaryBoolean.getValue());
  }

  writeBooleansArrayFunc(array, callback) {
    let boolMap = null;
    for (let i = 0; i < array.length; i++) {
      if (!boolMap) boolMap = new BinaryBoolean();
      boolMap.writeBoolean(callback(array[i]) ? 1 : 0);
      if ((i + 1) % 8 === 0) {
        this.writeBooleanMap(boolMap);
        boolMap = null;
      }
    }
    if (boolMap) {
      boolMap.fillZero();
      this.writeBooleanMap(boolMap);
    }
    return this;
  }

  writeWriter(writer) {
    if (!writer) return this.writeInt32(0);

    const data = writer.getData();
    this.writeInt32(writer.getTotalLength());
    for (const chunk of data) {
      this._write(chunk.value, chunk.length, chunk.method);
    }
    return this;
  }

  getData() { return this.data; }
  getTotalLength() { return this.totalLength; }

  getBuffer() {
    const buffer = new ArrayBuffer(this.totalLength);
    const view = new DataView(buffer);
    let offset = 0;

    for (const chunk of this.data) {
      view[chunk.method](offset, chunk.value, true);
      offset += chunk.length;
    }
    return buffer;
  }
}
