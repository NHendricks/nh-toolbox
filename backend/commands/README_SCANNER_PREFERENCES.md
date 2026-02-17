# Scanner Preferences - Implementation

## Overview

Scanner preferences are now saved persistently using a dedicated service, following the same pattern as the commander's FavoritesService.

## What Gets Saved

All scanner settings are now automatically saved to localStorage and restored when you return:

- **Last Used Scanner** - Automatically selects your preferred scanner
- **Resolution** - Your preferred DPI setting (150, 300, 600, 1200)
- **Color Mode** - Color, Grayscale, or Black & White
- **Format** - PDF, PNG, or JPG
- **Duplex** - Whether to scan both sides (default: enabled)
- **Multi-page** - Whether to scan all pages from ADF (default: enabled)

## How It Works

### Storage Service

The `ScannerPreferencesService` provides a centralized way to manage scanner preferences:

```typescript
import { scannerPreferencesService } from './docmanager/ScannerPreferencesService.js'

// Get last used scanner
const scannerId = scannerPreferencesService.getLastScannerId()

// Save preferences
scannerPreferencesService.updatePreferences({
  lastScannerId: 'scanner-123',
  resolution: '300',
  colorMode: 'color',
  format: 'pdf',
  duplex: true,
  multiPage: true,
})
```

### Auto-Save Behavior

Preferences are saved in two ways:

1. **Immediately on change** - When you change any setting (scanner, resolution, etc.), it's saved instantly
2. **After successful scan** - All preferences are saved after a successful scan completes

### Storage Location

Preferences are stored in browser localStorage with the key: `docmanager-scanner-preferences`

The data format is JSON:
```json
{
  "lastScannerId": "Brother DCP-9022CDW",
  "resolution": "300",
  "colorMode": "color",
  "format": "pdf",
  "duplex": true,
  "multiPage": true
}
```

## User Experience

When you open DocManager:

1. **Scanner Selection** - Your last used scanner is automatically selected (if still available)
2. **Settings Restored** - All scan settings (resolution, color mode, etc.) are restored from last session
3. **Immediate Feedback** - Changes are saved instantly as you adjust settings
4. **Persistent** - Preferences survive browser refresh and app restarts

## Implementation Details

### Files Modified

1. **ScannerPreferencesService.ts** (NEW)
   - Singleton service for managing preferences
   - localStorage-based persistence
   - Type-safe getters and setters

2. **DocManager.ts** (UPDATED)
   - Added service import
   - Added `loadPreferences()` method called on startup
   - Added individual change handlers for each control
   - Removed direct localStorage calls
   - Preferences are saved on every change and after successful scans

### Benefits Over Direct localStorage

- **Type Safety** - TypeScript interfaces ensure correct data types
- **Centralized Logic** - All storage logic in one place
- **Maintainability** - Easy to add new preferences
- **Consistency** - Same pattern as commander favorites
- **Error Handling** - Graceful fallbacks if localStorage fails

## Testing

To verify preferences are working:

1. Open DocManager
2. Select a scanner (if you have multiple)
3. Change some settings (resolution, format, etc.)
4. Refresh the page
5. Verify all your settings are restored

## Troubleshooting

If preferences aren't saving:

1. Check browser console for errors
2. Verify localStorage is enabled (not in private browsing)
3. Check that `localStorage.getItem('docmanager-scanner-preferences')` returns your saved preferences
4. Clear preferences: `localStorage.removeItem('docmanager-scanner-preferences')`

## Future Enhancements

Potential improvements:

- Export/import scanner preferences (like commander settings)
- Per-scanner preferences (different defaults for different scanners)
- Scan profiles (quick presets like "Quick Scan", "High Quality", "Archive")
- Cloud sync of preferences across devices
