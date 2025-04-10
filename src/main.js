const { app, BrowserWindow, ipcMain, screen, Menu, Tray, globalShortcut } = require('electron');
const path = require('path');
const Store = require('electron-store');

// 創建設定儲存庫
const store = new Store({
  schema: {
    windowBounds: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' }
      },
      default: { x: undefined, y: undefined, width: 800, height: 600 }
    },
    controllerConfig: {
      type: 'object',
      default: {
        opacity: 0.8,
        alwaysOnTop: true,
        controllerSize: 'medium', // 'small', 'medium', 'large'
        vibrationEnabled: true,
        keyboardMapping: {
          enabled: false,
          mappings: {}
        },
        lockPosition: false
      }
    }
  }
});

// 主視窗實例
let mainWindow = null;
let tray = null;
let isOverlayMode = false;

// 避免多實例運行
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 如果有其他實例嘗試運行，將焦點放到主視窗
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// 建立主視窗
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const storedBounds = store.get('windowBounds');
  
  mainWindow = new BrowserWindow({
    width: storedBounds.width || Math.min(800, width),
    height: storedBounds.height || Math.min(600, height),
    x: storedBounds.x,
    y: storedBounds.y,
    frame: !isOverlayMode, // 覆蓋模式下不顯示視窗框架
    transparent: isOverlayMode,
    alwaysOnTop: store.get('controllerConfig.alwaysOnTop'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    skipTaskbar: isOverlayMode,
    resizable: !store.get('controllerConfig.lockPosition')
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 設定視窗透明度
  if (isOverlayMode) {
    mainWindow.setOpacity(store.get('controllerConfig.opacity'));
  }

  // 儲存視窗位置和大小
  mainWindow.on('close', () => {
    if (!mainWindow.isMaximized()) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 建立系統托盤圖示
  createTray();
}

// 建立系統托盤圖示
function createTray() {
  tray = new Tray(path.join(__dirname, '../assets/tray.png'));
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '切換覆蓋模式', 
      click: () => {
        toggleOverlayMode();
      }
    },
    { 
      label: '設定',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('open-settings');
          mainWindow.focus();
        }
      }
    },
    {
      label: '鎖定位置',
      type: 'checkbox',
      checked: store.get('controllerConfig.lockPosition', false),
      click: (menuItem) => {
        store.set('controllerConfig.lockPosition', menuItem.checked);
        if (mainWindow) {
          mainWindow.setResizable(!menuItem.checked);
        }
      }
    },
    { type: 'separator' },
    { 
      label: '退出', 
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('虛擬觸控控制器');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// 切換覆蓋模式
function toggleOverlayMode() {
  isOverlayMode = !isOverlayMode;
  
  // 儲存當前位置
  let bounds = null;
  if (mainWindow) {
    bounds = mainWindow.getBounds();
    mainWindow.close();
    mainWindow = null;
  }
  
  // 重新建立視窗
  createWindow();
  
  // 恢復原位置
  if (bounds) {
    mainWindow.setBounds(bounds);
  }
}

// 設定全域快捷鍵
function registerGlobalShortcuts() {
  // 切換顯示/隱藏
  globalShortcut.register('Alt+Shift+C', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // 切換覆蓋模式
  globalShortcut.register('Alt+Shift+O', () => {
    toggleOverlayMode();
  });
}

// 應用程式準備就緒後創建視窗
app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcuts();
});

// 所有視窗關閉時退出應用程式 (macOS除外)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 設定IPC通信
ipcMain.on('toggle-overlay-mode', () => {
  toggleOverlayMode();
});

ipcMain.on('set-opacity', (event, opacity) => {
  store.set('controllerConfig.opacity', opacity);
  if (mainWindow && isOverlayMode) {
    mainWindow.setOpacity(opacity);
  }
});

ipcMain.on('set-always-on-top', (event, value) => {
  store.set('controllerConfig.alwaysOnTop', value);
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(value);
  }
});

ipcMain.on('set-controller-size', (event, size) => {
  store.set('controllerConfig.controllerSize', size);
});

// 新增IPC通信
ipcMain.on('set-lock-position', (event, value) => {
  store.set('controllerConfig.lockPosition', value);
  if (mainWindow) {
    mainWindow.setResizable(!value);
  }
});

ipcMain.on('set-vibration-enabled', (event, value) => {
  store.set('controllerConfig.vibrationEnabled', value);
});

ipcMain.on('set-keyboard-mapping', (event, config) => {
  store.set('controllerConfig.keyboardMapping', config);
});

// 退出前清理全域快捷鍵
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
}); 