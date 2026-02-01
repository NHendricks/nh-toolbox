# Icon Generation Tool

This directory contains a comprehensive icon generation script that creates all required icon formats from a single source image.

## Quick Start

1. **Install dependencies:**

   ```bash
   cd tools
   npm install
   ```

2. **Place your source icon:**
   - Put a 1024x1024 PNG image at `assets/icons/icon-1024.png`

3. **Generate all icons:**
   ```bash
   cd tools
   npm run generate-icons
   ```

## What Gets Generated

The script automatically creates:

- **icon.ico** - Windows executable icon (includes 16, 32, 48, 256 sizes)
- **icon-tray.png** - System tray icon (256x256)
- **icon-16.png** through **icon-512.png** - Various PNG sizes
- **icon.icns** - macOS application icon (only on macOS)

## Icon Formats Explained

### Windows (icon.ico)

- Used by the Windows executable
- Contains multiple embedded sizes for different display scenarios
- Automatically referenced in the build process

### macOS (icon.icns)

- Only generated when running on macOS (requires `iconutil`)
- Contains retina and non-retina versions at multiple sizes
- If running on Windows, you'll need to generate this on a Mac later

### Tray Icon (icon-tray.png)

- Used for the system tray notification area
- 256x256 pixels for high-DPI displays

### Multiple PNG Sizes

- Used for various UI elements and fallbacks
- Ensures crisp icons at different zoom levels

## Manual Icon Generation

If you prefer to generate icons manually or the script fails:

### Windows ICO:

```bash
cd tools
npm run convert-icon
```

### macOS ICNS (macOS only):

```bash
cd assets/icons
bash icons.sh
```

## Requirements

- **Node.js** 16 or higher
- **sharp** npm package for image resizing
- **png-to-ico** for Windows icon generation
- **iconutil** (macOS only, built-in) for .icns generation

## Troubleshooting

### Sharp installation fails

Sharp requires native binaries. If installation fails:

- Try updating Node.js
- On Windows, ensure you have build tools: `npm install --global windows-build-tools`
- Check: https://sharp.pixelplumbing.com/install

### Icon doesn't appear in built app

- Rebuild the app completely: `npm run buildWinApp` or `npm run buildMacApp`
- Clear any cached builds
- Verify icon files exist in `assets/icons/`

## Icon Design Tips

For best results, your source `icon-1024.png` should:

- Be exactly 1024x1024 pixels
- Use transparent background (or solid color that works at all sizes)
- Have clear, simple design that works at 16x16
- Avoid fine details that disappear at small sizes
- Test at multiple sizes before finalizing

## Files

- **generate-icons.js** - Main icon generation script
- **convert-icon.js** - Legacy Windows icon converter (still works)
- **package.json** - Contains npm scripts and dependencies

## Usage in Build Process

The build scripts automatically use icons from `assets/icons/`:

- Windows build uses `icon.ico`
- macOS build uses `icon.icns`
- Electron tray uses `icon-tray.png`

No additional configuration needed once icons are generated!
