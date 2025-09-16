export function lcFirst(str) {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
  
  export function ucFirst(str) {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }