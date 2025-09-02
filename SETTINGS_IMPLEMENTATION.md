# Settings Implementation for HexaForge

This document describes the implementation of the settings button and save/load functionality based on the original Factory Idle app.

## What Has Been Implemented

### 1. BinaryArrayWriter (`js/base/BinaryArrayWriter.js`)
- Binary data writing for game saves
- Support for various data types (int8, int16, int32, uint8, uint16, uint32, float64)
- Boolean array handling with BinaryBoolean helper class
- Buffer generation for save data

### 2. SaveManager (`js/play/SaveManager.js`)
- Manages both local and cloud saves
- Automatic save intervals (local: 5 seconds, cloud: 15 minutes)
- Manual save/load functionality for 3 save slots
- Conflict resolution between local and cloud saves
- Integration with PlayFab API for cloud saves

### 3. PlayFab API (`js/play/api/PlayFabApi.js`)
- Cloud save integration using PlayFab service
- User authentication with custom ID
- Save data storage and retrieval
- Automatic re-login every 12 hours

### 4. Settings UI (`js/ui/SettingsUi.js`)
- Modal dialog for game settings
- User key management and backup
- Save slot management (3 slots)
- Manual save/load operations
- Game reset functionality
- Developer mode features

### 5. Helper UI Components
- **LoadingUi** (`js/ui/helper/LoadingUi.js`): Loading indicators
- **ConfirmUi** (`js/ui/helper/ConfirmUi.js`): Confirmation dialogs

### 6. User Management
- **UserHash** (`js/play/UserHash.js`): User identification and hash management
- **UrlHandler** (`js/play/UrlHandler.js`): URL parameter parsing

### 7. Configuration
- Save intervals configuration in `js/config/config.js`
- CSS styling for all UI components in `main.css`

## How to Use

### Settings Button
1. Click the "Settings" button in the factory menu
2. The settings modal will appear with:
   - User key display and copy functionality
   - Save slot management (3 slots)
   - Manual save/load operations
   - Game reset options

### Save Slots
- **Slot 1, 2, 3**: Three separate save slots for manual saves
- Each slot shows last save time and tick count
- Save button to create a manual save
- Load button to restore from a save (with confirmation)

### Cloud Saves
- Automatic cloud saves every 15 minutes
- Manual saves are also uploaded to cloud
- Local saves every 5 seconds for quick recovery
- Conflict resolution prioritizes newer saves

## Technical Details

### Save Data Format
```javascript
{
    meta: {
        ver: tickCount,
        timestamp: unixTimestamp,
        date: formattedDate
    },
    data: "binary-or-encoded-data"
}
```

### API Integration
- PlayFab title ID: `1BFF70` (needs to be updated for your project)
- Custom ID authentication
- User data storage for saves and metadata

### Dependencies
- RequireJS for module loading
- jQuery for DOM manipulation
- PlayFab SDK for cloud services

## Next Steps

### 1. Complete Binary Export
- Implement `exportToWriter()` methods in Game, Factory, Component classes
- Add BinaryArrayReader for loading save data
- Base64 encoding/decoding for save data

### 2. Game State Management
- Implement proper game state serialization
- Add offline progress calculation
- Handle game reset functionality

### 3. PlayFab Configuration
- Update PlayFab title ID for your project
- Configure proper game settings in PlayFab dashboard
- Add analytics and player statistics

### 4. Error Handling
- Add proper error handling for save/load failures
- Network connectivity detection
- Fallback to local-only saves

## Files Modified

- `js/base/BinaryArrayWriter.js` - New
- `js/play/SaveManager.js` - New
- `js/play/api/PlayFabApi.js` - New
- `js/ui/SettingsUi.js` - New
- `js/ui/helper/LoadingUi.js` - New
- `js/ui/helper/ConfirmUi.js` - New
- `js/play/UserHash.js` - New
- `js/play/UrlHandler.js` - New
- `js/play/api/ApiFactory.js` - New
- `js/config/config.js` - Updated
- `js/ui/GameUi.js` - Updated
- `js/play/Play.js` - Updated
- `js/Main.js` - Updated
- `main.css` - Updated
- `index.html` - Updated

## Testing

1. Start the development server: `python -m http.server 8000`
2. Open `http://localhost:8000` in your browser
3. Navigate to a factory and click the "Settings" button
4. Test save/load functionality with the three save slots
5. Verify cloud save integration (requires PlayFab configuration)

## Notes

- The current implementation uses mock save data until BinaryArrayWriter is fully integrated
- PlayFab integration requires proper title configuration
- Local saves work immediately, cloud saves require API setup
- All UI components are styled to match the game's dark theme
