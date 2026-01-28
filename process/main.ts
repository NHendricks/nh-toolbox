import * as fs from 'fs';
import { registerCommands } from './register-commands';

// electron/main.js
const {
  app,
  BrowserWindow,
  shell,
  screen,
  globalShortcut,
  clipboard,
  Tray,
  Menu,
} = require('electron');
const path = require('path');
const installExtension = require('electron-devtools-installer').default;
const { REDUX_DEVTOOLS } = require('electron-devtools-installer');

const isDev = process.env.NODE_ENV
  ? process.env.NODE_ENV.startsWith('development')
  : false;

let tray: any = null;
let version = '0.0';
if (!isDev) {
  process.env.NODE_ENV = 'production';
  const versionFilePath = path.join(process.resourcesPath, 'version.txt');
  version = '' + fs.readFileSync(versionFilePath, 'utf8');
} else {
  let versionsfile = path.resolve(__dirname, '../../version/version.txt');
  version = fs.readFileSync(versionsfile, 'utf8');
}

function createTray() {
  // Set tray icon path based on environment and platform
  // macOS needs a small PNG (16x16 or 22x22) for tray icons
  let trayIconPath: string;
  if (isDev) {
    // In development, use the assets folder
    if (process.platform === 'darwin') {
      trayIconPath = path.join(__dirname, '../../assets/icons/icon-tray.png');
    } else if (process.platform === 'win32') {
      trayIconPath = path.join(__dirname, '../../assets/icons/icon.ico');
    } else {
      trayIconPath = path.join(__dirname, '../../assets/icons/icon-1024.png');
    }
  } else {
    // In production, use the Resources folder
    if (process.platform === 'darwin') {
      trayIconPath = path.join(process.resourcesPath, 'icon-tray.png');
    } else if (process.platform === 'win32') {
      trayIconPath = path.join(process.resourcesPath, '../icon.ico');
    } else {
      trayIconPath = path.join(process.resourcesPath, 'icon-1024.png');
    }
  }

  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `nh-toolbox v${version}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Show App',
      click: () => {
        const windows = BrowserWindow.getAllWindows();
        if (windows.length > 0) {
          windows[0].show();
          windows[0].focus();
        } else {
          createWindow();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('nh-toolbox');
  tray.setContextMenu(contextMenu);

  // On macOS, clicking the tray icon should show/hide the window
  tray.on('click', () => {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      if (windows[0].isVisible()) {
        windows[0].hide();
      } else {
        windows[0].show();
        windows[0].focus();
      }
    } else {
      createWindow();
    }
  });
}

async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // On macOS, the icon is set via the app bundle - don't set it in BrowserWindow
  // On other platforms, set the icon explicitly
  const windowOptions: any = {
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      backgroundThrottling: false,
    },
  };

  // Only set icon for non-macOS platforms
  if (process.platform !== 'darwin') {
    let iconPath: string;
    if (isDev) {
      if (process.platform === 'win32') {
        iconPath = path.join(__dirname, '../../assets/icons/icon.ico');
      } else {
        iconPath = path.join(__dirname, '../../assets/icons/icon-1024.png');
      }
    } else {
      if (process.platform === 'win32') {
        iconPath = path.join(process.resourcesPath, '../icon.ico');
      } else {
        iconPath = path.join(process.resourcesPath, 'icon-1024.png');
      }
    }
    windowOptions.icon = iconPath;
  }

  const win = new BrowserWindow(windowOptions);
  win.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    // Öffne die URL im Standardbrowser
    shell.openExternal(url);
    return { action: 'deny' }; // Verhindere, dass Electron ein neues Fenster öffnet
  });

  console.log('dev=' + isDev);

  if (isDev) {
    win.loadURL('http://localhost:5173');
    try {
      await installExtension(REDUX_DEVTOOLS);
    } catch (err) {}
    process.on('unhandledRejection', (reason, promise) => {
      console.error('unhandledRejection:', reason);
    });
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../../ui/dist/index.html'));
  }
}

const { ipcMain } = require('electron');
registerCommands(ipcMain, version);

// Clipboard IPC handler
ipcMain.handle('clipboard-write-text', (_event: any, text: string) => {
  try {
    clipboard.writeText(text);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('clipboard-read-text', () => {
  try {
    const text = clipboard.readText();
    return { success: true, text };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createTray();
  createWindow();
});
app.on('window-all-closed', () => {
  // Don't quit the app when all windows are closed - keep tray icon
  // Users can quit from the tray menu
});

app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
  }
});
