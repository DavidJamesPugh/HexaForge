// src/lib/bin/Base64ArrayBuffer.js
export default class Base64ArrayBuffer {
  // Base64 characters
  static chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  // Lookup table
  static lookup = null;

  /** Initialize lookup table */
  static setup() {
    if (this.lookup) return; // already initialized
    this.lookup = new Uint8Array(256);
    for (let i = 0; i < this.chars.length; i++) {
      this.lookup[this.chars.charCodeAt(i)] = i;
    }
  }

  /** Encode ArrayBuffer to Base64 string */
  static encode(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let base64 = "";
    for (let i = 0; i < bytes.length; i += 3) {
      const byte1 = bytes[i];
      const byte2 = bytes[i + 1] || 0;
      const byte3 = bytes[i + 2] || 0;

      base64 += this.chars[byte1 >> 2];
      base64 += this.chars[((byte1 & 0x03) << 4) | (byte2 >> 4)];
      base64 += this.chars[((byte2 & 0x0F) << 2) | (byte3 >> 6)];
      base64 += this.chars[byte3 & 0x3F];
    }

    // Add padding
    const mod = bytes.length % 3;
    if (mod === 1) base64 = base64.slice(0, -2) + "==";
    else if (mod === 2) base64 = base64.slice(0, -1) + "=";

    return base64;
  }

  /** Decode Base64 string to ArrayBuffer */
  static decode(base64) {
    this.setup();

    // Remove padding for calculation
    let padding = 0;
    if (base64.endsWith("==")) padding = 2;
    else if (base64.endsWith("=")) padding = 1;

    const bufferLength = (base64.length * 3) / 4 - padding;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(arrayBuffer);

    let byteIndex = 0;
    for (let i = 0; i < base64.length; i += 4) {
      const n = this.lookup[base64.charCodeAt(i)];
      const n1 = this.lookup[base64.charCodeAt(i + 1)];
      const n2 = this.lookup[base64.charCodeAt(i + 2)];
      const n3 = this.lookup[base64.charCodeAt(i + 3)];

      bytes[byteIndex++] = (n << 2) | (n1 >> 4);
      if (!isNaN(n2)) bytes[byteIndex++] = ((n1 & 0x0F) << 4) | (n2 >> 2);
      if (!isNaN(n3)) bytes[byteIndex++] = ((n2 & 0x03) << 6) | n3;
    }

    return arrayBuffer;
  }
}

// Initialize lookup table immediately
Base64ArrayBuffer.setup();
