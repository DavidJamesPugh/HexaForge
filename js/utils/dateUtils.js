export function dateToStr(date, useUTC = false) {
    if (!date) return "";
    let year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();

    if (useUTC) {
        year = date.getUTCFullYear();
        month = date.getUTCMonth() + 1;
        day = date.getUTCDate();
        hour = date.getUTCHours();
        minute = date.getUTCMinutes();
        second = date.getUTCSeconds();
    }

    const pad = (n) => (n < 10 ? "0" + n : n);

    return `${year}.${pad(month)}.${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
}