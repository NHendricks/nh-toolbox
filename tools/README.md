# 🛠️ Electron Build Tools

To avoid electron builder or electron packager magic and for better performance we just build the apps with a simple script. Transparent and easy to maintain.

## 📦 Features

- Manual Electron app build without ASAR packaging
- Custom icon support for Windows (.ico) and macOS (.icns)
- PNG to ICO conversion for Windows builds
- Executable metadata configuration

## 🎨 Icon Setup

### Converting Icons

Before building the Windows app, convert your PNG icon to ICO format:

```bash
cd tools
npm run convert-icon
```

This converts `assets/icons/icon-1024.png` to `assets/icons/icon.ico`.

### Building with Icons

The build script automatically applies the icon to the Windows executable:

```bash
cd tools
npm run build
```

The icon is applied along with version information and metadata to `nh-toolbox.exe`.

## 📁 Asset Requirements

- **Windows**: `assets/icons/icon.ico` (automatically generated from PNG)
- **macOS**: `assets/icons/icon.icns` (already present)
- **Source**: `assets/icons/icon-1024.png` (1024x1024 PNG)

## 🚀 Build Process

The Windows build process includes:

1. Cleaning and preparing directories
2. Copying Electron distribution
3. Preparing app content (backend, process, UI)
4. Copying app folder to resources
5. Copying version.txt
6. Renaming electron.exe to nh-toolbox.exe
7. **Applying icon and metadata to executable**
8. Summary and completion
