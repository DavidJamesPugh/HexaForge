// UrlHandler.js

const getUrlVars = () => {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;
};

const identifySite = () => {
    const params = getUrlVars();
    const ref = params.ref;

    if (params.kongregate_username && ref === "kongregate") return "kongregate";
    if (ref === "notdoppler") return "notdoppler";
    if (ref === "armorgames") return "armorgames";
    if (ref === "newgrounds") return "newgrounds";
    if (ref === "beta") return "beta";

    const href = window.location.href;
    if (href.includes("localhost") || href.includes("file")) return "localhost";

    return "direct";
};

export default {
    getUrlVars,
    identifySite,
};
