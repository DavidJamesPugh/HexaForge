// src/lib/bin/Base64ArrayBuffer.js
class Base64ArrayBuffer {
    static chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    static lookup = null;
  
    static setup() {
      this.lookup = new Uint8Array(256);
      for (let i = 0; i < this.chars.length; i++) {
        this.lookup[this.chars.charCodeAt(i)] = i;
      }
    }
  
    static encode(arrayBuffer) {
      const bytes = new Uint8Array(arrayBuffer);
      const len = bytes.length;
      let base64 = "";
  
      for (let i = 0; i < len; i += 3) {
        base64 += this.chars[bytes[i] >> 2];
        base64 += this.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += this.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += this.chars[bytes[i + 2] & 63];
      }
  
      if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + "=";
      } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + "==";
      }
  
      return base64;
    }
  
    static decode(base64) {
      if (!this.lookup) this.setup();
  
      let bufferLength = (base64.length * 3) / 4;
      if (base64[base64.length - 1] === "=") bufferLength--;
      if (base64[base64.length - 2] === "=") bufferLength--;
  
      const arrayBuffer = new ArrayBuffer(bufferLength);
      const bytes = new Uint8Array(arrayBuffer);
  
      let p = 0;
      for (let i = 0; i < base64.length; i += 4) {
        const n = this.lookup[base64.charCodeAt(i)];
        const i1 = this.lookup[base64.charCodeAt(i + 1)];
        const i2 = this.lookup[base64.charCodeAt(i + 2)];
        const i3 = this.lookup[base64.charCodeAt(i + 3)];
  
        bytes[p++] = (n << 2) | (i1 >> 4);
        if (i2 !== undefined) bytes[p++] = ((i1 & 15) << 4) | (i2 >> 2);
        if (i3 !== undefined) bytes[p++] = ((i2 & 3) << 6) | i3;
      }
  
      return arrayBuffer;
    }
  }
  
  // Initialize lookup table
  Base64ArrayBuffer.setup();
  
  export default Base64ArrayBuffer;
  