// src/base/NumberFormat.js

const names = {
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

const numberFormat = {
  format(e) {
    if (e === undefined) return "?";

    const abs = Math.abs(e);

    if (abs < 10) return Math.round(e * 100) / 100;
    if (abs < 1e3) return Math.round(e * 10) / 10;
    if (abs < 1e6) return Number(e).toFixed(0).replace(/\d(?=(\d{3})+$)/g, "$& ");

    // Scientific notation handling
    let parts = e.toString().split("e+", 2);
    let t = Number(parts[0]);
    const n = t < 0 ? 2 : 1;
    let i = 3 * Math.floor((Math.abs(Math.round(t)) .toString().length - n) / 3);
    let r = i + (parts[1] ? Number(parts[1]) : 0);
    const o = r % 3;
    t *= Math.pow(10, o - i);
    r -= o;

    return Math.round(100 * t) / 100 + (names[r] ? names[r] : "e" + r);
  },

  formatNumber(e) {
    return this.format(e);
  },

  formatNumberPlus(e) {
    return (e > 0 ? "+" : "") + this.format(e);
  },

  test() {
    const tests = {
      1: "1",
      10: "10",
      10.5: "10.5",
      100: "100",
      100.5: "100.5",
      1e3: "1 000",
      1000.5: "1 001",
      1234.5: "1 235",
      1.2134523451212334e24: "1.21 septillion",
      1.4860535876960295e25: "14.86 septillion",
    };

    for (const t in tests) {
      const n = this.nf(Number(t));
      n === tests[t]
        ? console.log(`${t} == ${n}`)
        : console.error(`${t} != ${n}`);

      const i = this.nf(-Number(t));
      i === "-" + tests[t]
        ? console.log(`-${t} == ${i}`)
        : console.error(`-${t} != ${i}`);
    }
  },
};

export default numberFormat;
export { names, numberFormat };
