// TODO: Implement main game configuration module
define("config/config", [], function() {
    // Placeholder - implement when ready
    // This basic structure prevents the Main.js error
    return {
        imageMap: {
            path: "img/" // Basic path for images
        },
        saveManager: {
            cloudSaveIntervalMs: 900000,  // 15 minutes
            localSaveIntervalMs: 5000     // 5 seconds
        },
        userHash: {
            key: "HexaForgeUserHash"
        }
    };
});
