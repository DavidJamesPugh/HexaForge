// lib/bin/BinaryArrayReader.js
import BinaryBoolean from "./BinaryBoolean";
export default class BinaryArrayReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.dataView = new DataView(buffer);
    this.offset = 0;
  }

  _read(size, method) {
    if (this.offset + size > this.buffer.byteLength) {
      throw new Error(
        `Read out of bounds: trying to read ${size} bytes at offset ${this.offset}, buffer length ${this.buffer.byteLength}`
      );
    }
    const value = this.dataView[method](this.offset, true); // assuming little-endian
    this.offset += size;
    return value;
  }

  readBooleanMap() {
    return new BinaryBoolean(this.readUint8()).reverse();
  }

  readChar() {
    return String.fromCharCode(this.readInt8());
  }

  readInt8() {
    return this._read(1, "getInt8");
  }

  readInt16() {
    return this._read(2, "getInt16");
  }

  readInt32() {
    return this._read(4, "getInt32");
  }

  readUint8() {
    return this._read(1, "getUint8");
  }

  readUint16() {
    return this._read(2, "getUint16");
  }

  readUint32() {
    return this._read(4, "getUint32");
  }

  readFloat64() {
    return this._read(8, "getFloat64");
  }

  readReader() {
    const length = this.readInt32();
    const buffer = new ArrayBuffer(length);
    const array = new Int8Array(buffer, 0, length);

    for (let i = 0; i < length; i++) {
      array[i] = this.readInt8();
    }

    return new BinaryArrayReader(buffer);
  }

  readBooleanArrayFunc(length, callback) {
    let map = null;
    for (let i = 0; i < length; i++) {
      if (i % 8 === 0) {
        map = this.readBooleanMap();
      }
      callback(i, map.readBoolean());
    }
  }

  getBuffer() {
    return this.buffer;
  }

  getLength() {
    return this.buffer.byteLength;
  }

  getOffset() {
    return this.offset;
  }
}
