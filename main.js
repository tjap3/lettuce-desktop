const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

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

function projectsDir() {
  const dir = path.join(app.getPath('userData'), 'lettuce-projects');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

ipcMain.handle('save-project', async (event, { name, rows }) => {
  const dir = projectsDir();
  const id = `${Date.now()}-${name.replace(/[^a-z0-9-_]/gi, '_')}`;
  const payload = { id, name, savedAt: new Date().toISOString(), rows };
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(payload, null, 2), 'utf8');
  return { id, name, savedAt: payload.savedAt };
});

ipcMain.handle('list-projects', async () => {
  const dir = projectsDir();
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const content = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      return { id: content.id, name: content.name, savedAt: content.savedAt, rowCount: content.rows.length };
    })
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
});

ipcMain.handle('load-project', async (event, id) => {
  const dir = projectsDir();
  const filePath = path.join(dir, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
});
ipcMain.handle('delete-project', async (event, id) => {
  const dir = projectsDir();
  const filePath = path.join(dir, `${id}.json`);
  if (!fs.existsSync(filePath)) return { deleted: false };
  fs.unlinkSync(filePath);
  return { deleted: true };
});

app.whenReady().then(createWindow);
