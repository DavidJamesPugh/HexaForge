// BinaryBoolean.js
export default class BinaryBoolean {
    constructor() {
      this.buffer = 0;
      this.length = 0;
    }
  
    writeAll(...values) {
      for (let i = 0; i < 8; i++) {
        this.writeBoolean(values[i]);
      }
      return this;
    }
  
    writeBoolean(value) {
      this.buffer <<= 1;
      this.buffer |= value ? 1 : 0;
      this.length++;
      return this;
    }
  
    fillZero() {
      while (this.length < 8) {
        this.writeBoolean(0);
      }
    }
  
    readBoolean() {
      const value = this.buffer & 1;
      this.buffer >>= 1;
      return !!value;
    }
  
    getValue() {
      return this.buffer;
    }
  
    reverse() {
      const values = [];
      for (let i = 0; i < 8; i++) {
        values.push(this.readBoolean());
      }
      for (let i = 0; i < 8; i++) {
        this.writeBoolean(values[i]);
      }
      return this;
    }
  
    toString() {
      return this.buffer.toString();
    }
  }
  