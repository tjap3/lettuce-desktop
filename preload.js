const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lettuceAPI', {
  searchText: (term) => ipcRenderer.invoke('search-text', term),

  uploadCsv: () => ipcRenderer.invoke('upload-csv')
});