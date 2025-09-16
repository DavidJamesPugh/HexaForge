export function arrayToHumanStr(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    return `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
  }