// TODO: Implement main game configuration module
define("config/config", [], function() {
    // Placeholder - implement when ready
    // This basic structure prevents the Main.js error
   
    return {
        userHash: { key: "FactoryIdleUserHash" },
        imageMap: { path: "" },
        api: { server: { url: "/api/games" }, armorGames: { gameKey: "" }, local: { storageKey: "FactoryIdleLocal" } },
        saveManager: { cloudSaveIntervalMs: 9e5, localSaveIntervalMs: 5e3 },
        main: { warnToStoreUserHashAfterTicks: { 1e4: !0, 1e5: !0, 1e6: !0 } },
    };
});
