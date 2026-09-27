import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function getDataFilePath() {
  const userDataDir = app.getPath('userData');
  return path.join(userDataDir, 'neet_mock_tracker_data.json');
}

function readStoredData() {
  try {
    const filePath = getDataFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed reading stored AppData file:', err);
  }
  return null;
}

function writeStoredData(data: Record<string, unknown>) {
  try {
    const filePath = getDataFilePath();
    const existing = readStoredData() || {};
    const merged = { ...existing, ...data };
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed writing stored AppData file:', err);
    return false;
  }
}

async function loadAppURL(window: BrowserWindow) {
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (!isDev) {
    await window.loadFile(path.join(__dirname, '../dist/index.html'));
    return;
  }

  const candidateUrls = [
    process.env.VITE_DEV_SERVER_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ].filter(Boolean) as string[];

  for (let attempt = 0; attempt < 35; attempt++) {
    for (const devUrl of candidateUrls) {
      try {
        await window.loadURL(devUrl);
        return;
      } catch {
        // Continue searching candidates
      }
    }
    await new Promise((r) => setTimeout(r, 350));
  }

  // Fallback to built dist/index.html
  try {
    await window.loadFile(path.join(__dirname, '../dist/index.html'));
  } catch (err) {
    console.error('Failed loading fallback:', err);
  }
}

function createWindow() {
  const iconCandidates = [
    path.join(__dirname, '../build/icon.ico'),
    path.join(__dirname, '../dist/icon.png'),
    path.join(__dirname, '../public/icon.png'),
  ];
  const iconPath = iconCandidates.find((p) => fs.existsSync(p));

  mainWindow = new BrowserWindow({
    title: 'NEET OS',
    icon: iconPath,
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    frame: false,
    backgroundColor: '#05070B',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Ready to show to prevent flashing white screen
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  loadAppURL(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Window controls IPC
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() || false;
});

// Data persistence IPC
ipcMain.handle('get-mocks', () => {
  const data = readStoredData();
  return data?.mocks || null;
});

ipcMain.handle('save-mocks', (_, mocks) => {
  return writeStoredData({ mocks });
});

ipcMain.handle('get-settings', () => {
  const data = readStoredData();
  return data?.settings || null;
});

ipcMain.handle('save-settings', (_, settings) => {
  return writeStoredData({ settings });
});

// File Export Dialog IPC
ipcMain.handle('export-data', async (_, content: string, defaultFileName: string, filterName: string, extensions: string[]) => {
  if (!mainWindow) return false;

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export NEET OS Records',
    defaultPath: defaultFileName,
    filters: [{ name: filterName, extensions }],
  });

  if (!canceled && filePath) {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed exporting file:', err);
    }
  }
  return false;
});

// File Import Dialog IPC
ipcMain.handle('import-data', async () => {
  if (!mainWindow) return null;

  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import NEET OS Backup JSON',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
    properties: ['openFile'],
  });

  if (!canceled && filePaths.length > 0) {
    try {
      return fs.readFileSync(filePaths[0], 'utf-8');
    } catch (err) {
      console.error('Failed reading import file:', err);
    }
  }
  return null;
});
