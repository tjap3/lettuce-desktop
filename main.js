const { app, BrowserWindow, ipcMain } = require('electron');

const API_URL = 'http://warrentron.nottingham.ac.uk:8000';
const API_KEY = 'test_key_123';

ipcMain.handle('search-text', async (event, term) => {
  console.log('Sending key:', JSON.stringify(API_KEY));
  try {
    const response = await fetch(`${API_URL}/search/text-search/${term}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    console.log('Status:', response.status);
    return response.json();
  } catch (err) {
    console.error('Fetch failed. Cause:', err.cause);
    throw err;
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: __dirname + '/preload.js',
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile('index.html');
}

const { dialog } = require('electron');
const fs = require('fs');

ipcMain.handle('upload-csv', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });

  if (result.canceled) {
    return null;
  }

  const filePath = result.filePaths[0];
  const csvText = fs.readFileSync(filePath, 'utf8');
  return csvText;
});

app.whenReady().then(createWindow);