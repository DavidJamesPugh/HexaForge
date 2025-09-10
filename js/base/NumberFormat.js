// base/Logger.js

const NAMES = {
    6: " million",
    9: " billion",
    12: " trillion",
    15: " quadrillion",
    18: " quintillion",
    21: " sextillion",
    24: " septillion",
    27: " octillion",
    30: " nonillion",
    33: " decillion",
    36: " undecillion",
    39: " duodecillion",
    42: " tredecillion",
    45: " quattuordecillion",
    48: " quindecillion",
    51: " sexdecillion",
    54: " septendecillion",
    57: " octodecillion",
    60: " novemdecillion",
    63: " vigintillion",
  };
  
  export default class NumberFormat {

    static formatNumber(value) {
      if (value === undefined || value === null) return "?";
  
      const abs = Math.abs(value);
      if (abs < 10) return Math.round(value * 100) / 100;
      if (abs < 1e3) return Math.round(value * 10) / 10;
      if (abs < 1e6) return Math.round(value).toLocaleString();
  
      // Scientific/exponential handling
      const parts = value.toString().split("e+");
      let t = Number(parts[0]);
      const exp = parts[1] ? Number(parts[1]) : 0;
      const n = t < 0 ? 2 : 1;
      const i = 3 * Math.floor((t.toFixed(0).length - n) / 3);
      let r = i + exp;
      const o = r % 3;
      t *= Math.pow(10, o - i);
      r -= o;
  
      return Math.round(t * 100) / 100 + (NAMES[r] || `e${r}`);
    }
  
    static formatNumberWithSign(value) {
      const sign = value > 0 ? "+" : "";
      return sign + Logger.formatNumber(value);
    }
  
    static test() {
      const testValues = {
        1: "1",
        10: "10",
        10.5: "10.5",
        100: "100",
        100.5: "100.5",
        1e3: "1 000",
        1000.5: "1 001",
        1234.5: "1 235",
        1.2134523451212334e24: "1.21 septillion",
        1.2134523451212334e25: "14.86 septillion",
        1.2134523451212334e63: "121.35 vigintillion",
      };
  
      for (const val in testValues) {
        const expected = testValues[val];
        const formatted = Logger.formatNumber(Number(val));
        if (formatted === expected) {
          console.log(`${val} => ${formatted} ✅`);
        } else {
          console.error(`${val} => ${formatted} ❌ (expected ${expected})`);
        }
  
        const formattedNeg = Logger.formatNumber(-Number(val));
        if (formattedNeg === `-${expected}`) {
          console.log(`-${val} => ${formattedNeg} ✅`);
        } else {
          console.error(`-${val} => ${formattedNeg} ❌ (expected -${expected})`);
        }
      }
    }
  }
  