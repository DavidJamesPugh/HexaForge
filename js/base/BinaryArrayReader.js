import BinaryBoolean from "./BinaryBoolean.js";

export default class BinaryArrayReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.dataView = new DataView(buffer);
    this.offset = 0;
  }

  _read(byteLength, method) {
    const value = this.dataView[method](this.offset, true);
    this.offset += byteLength;
    return value;
  }

  readInt8() { return this._read(1, "getInt8"); }
  readInt16() { return this._read(2, "getInt16"); }
  readInt32() { return this._read(4, "getInt32"); }

  readUint8() { return this._read(1, "getUint8"); }
  readUint16() { return this._read(2, "getUint16"); }
  readUint32() { return this._read(4, "getUint32"); }

  readFloat64() { return this._read(8, "getFloat64"); }

  readChar() {
    return String.fromCharCode(this.readInt8());
  }

  readBooleanMap() {
    return new BinaryBoolean().writeAll(this.readUint8()).reverse();
  }

  readBooleanArrayFunc(length, callback) {
    let boolMap = null;
    for (let i = 0; i < length; i++) {
      if (i % 8 === 0) boolMap = this.readBooleanMap();
      callback(i, boolMap.readBoolean());
    }
  }

  getBuffer() { return this.buffer; }
  getLength() { return this.buffer.byteLength; }
  getOffset() { return this.offset; }
}
