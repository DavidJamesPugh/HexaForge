# Factory Idle Game - Frontend Unminification

This folder contains the unminified version of the game's frontend, extracted from `dist/app.js`.

## Current Status

### ✅ Completed Files
1. **`js/Main.js`** - Main application controller (primary entry point)
2. **`index.html`** - Main HTML file with RequireJS configuration (now like-for-like with original)
3. **`main.css`** - Main stylesheet (copied from dist)
4. **`httpMigrate.js`** - HTTP migration script (copied from dist)
5. **`img/`** - All game images and assets (copied from dist)

### 🔄 Next Steps (Priority Order)
1. **`js/config/Meta.js`** - Meta configuration module ✅ (placeholder created)
2. **`js/config/config.js`** - Main game configuration ✅ (placeholder created)
3. **`js/config/event/`** - Event constant modules ✅ (placeholders created)
   - `GlobalUiEvent.js` ✅
   - `GameUiEvent.js` ✅
   - `GameEvent.js` ✅
   - `FactoryEvent.js` ✅
   - `ApiEvent.js` ✅
4. **`js/play/Play.js`** - Play controller module ✅ (placeholder created)
5. **`js/base/ImageMap.js`** - Image loading and management ✅ (placeholder created)
6. **`js/ui/MainUi.js`** - Main UI controller ✅ (placeholder created)

## Architecture Notes

- **Entry Point**: `js/Main.js` is loaded first by RequireJS
- **Module System**: Uses RequireJS AMD modules with `define()` and `require()`
- **Dependencies**: jQuery, Handlebars, Canvas API
- **Base URL**: RequireJS is configured with `baseUrl: "js"`
- **HTML Structure**: Now matches the original `dist/index.html` exactly

## Testing

The frontend can now be served directly from the `Front end` folder using:
```javascript
app.use(express.static('Front end'));
```

Instead of the previous:
```javascript
app.use(express.static('dist'));
```

## File Structure
```
Front end/
├── js/
│   ├── Main.js (✅ Complete)
│   ├── config/
│   │   ├── Meta.js (✅ Placeholder)
│   │   ├── config.js (✅ Placeholder)
│   │   └── event/
│   │       ├── GlobalUiEvent.js (✅ Placeholder)
│   │       ├── GameUiEvent.js (✅ Placeholder)
│   │       ├── GameEvent.js (✅ Placeholder)
│   │       ├── FactoryEvent.js (✅ Placeholder)
│   │       └── ApiEvent.js (✅ Placeholder)
│   ├── play/
│   │   └── Play.js (✅ Placeholder)
│   ├── base/
│   │   └── ImageMap.js (✅ Placeholder)
│   └── ui/
│       └── MainUi.js (✅ Placeholder)
├── img/ (✅ Complete - all game assets)
├── index.html (✅ Complete - like-for-like with original)
├── main.css (✅ Complete - copied from dist)
├── httpMigrate.js (✅ Complete - copied from dist)
└── README.md (✅ Complete)
```

## Key Differences from Original

The main difference is that instead of loading `app.js` (the minified bundle), we now:
1. Load RequireJS, jQuery, and Handlebars from CDN
2. Load our unminified `js/main.js` 
3. Use RequireJS to load the Main module and its dependencies

This allows us to gradually unminify the code while maintaining the exact same user experience and loading behavior.

## Current Status

**All dependency files are now created as placeholders!** 🎉

The page should now load without RequireJS errors. When you're ready to continue:
1. Start with `js/config/Meta.js` - implement the actual Meta configuration
2. Then `js/config/config.js` - implement the main game configuration
3. Continue with the event modules, then Play, ImageMap, and MainUi

Each placeholder file has a TODO comment explaining what needs to be implemented.
