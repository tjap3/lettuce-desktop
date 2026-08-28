const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lettuceAPI', {
  searchText: (term) => ipcRenderer.invoke('search-text', term),

  uploadCsv: () => ipcRenderer.invoke('upload-csv'),

  saveProject: (name, rows) => ipcRenderer.invoke('save-project', { name, rows }),
  listProjects: () => ipcRenderer.invoke('list-projects'),
  loadProject: (id) => ipcRenderer.invoke('load-project', id),
  deleteProject: (id) => ipcRenderer.invoke('delete-project', id),
});
