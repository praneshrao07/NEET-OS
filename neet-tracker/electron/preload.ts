import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getMocks: () => ipcRenderer.invoke('get-mocks'),
  saveMocks: (mocks: unknown) => ipcRenderer.invoke('save-mocks', mocks),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('save-settings', settings),
  exportData: (content: string, defaultFileName: string, filterName: string, extensions: string[]) =>
    ipcRenderer.invoke('export-data', content, defaultFileName, filterName, extensions),
  importData: () => ipcRenderer.invoke('import-data'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
});
