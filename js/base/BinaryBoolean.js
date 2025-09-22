// BinaryBoolean.js
export default class BinaryBoolean {
    constructor(initialValue = 0, initialLength = 0) {
      // Allow initializing from a byte when decoding
      if (typeof initialValue === "number") {
        this.buffer = initialValue >>> 0; // ensure unsigned
        this.length = initialLength || 8; // when reading from byte, default to 8 bits
      } else {
        this.buffer = 0;
        this.length = 0;
      }
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
  