const {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut,
  Tray,
  nativeImage,
  ipcMain,
  Menu,
} = require("electron");
const path = require("path");

let win, tray;
let history = [];
let lastText = "";

function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 520,
    show: false,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  win.loadFile("index.html");
  win.on("blur", () => win.hide());
}

function startWatching() {
  setInterval(() => {
    const text = clipboard.readText().trim();
    if (!text || text === lastText) return;

    lastText = text;
    history = [text, ...history.filter((t) => t !== text)];
    if (history.length > 50) history.pop();

    win.webContents.send("history-update", history);
  }, 500);
}

ipcMain.on("copy-item", (_, text) => {
  if (text) clipboard.writeText(text);
  win.hide();
});

ipcMain.on("clear-history", () => {
  history = [];
  lastText = "";
  win.webContents.send("history-update", history);
});

ipcMain.on("delete-item", (_, text) => {
  history = history.filter((t) => t !== text);
  win.webContents.send("history-update", history);
});

ipcMain.on("quit-app", () => {
  app.quit();
});

ipcMain.on("hide-window", () => {
  win.hide();
});

app.whenReady().then(() => {
  createWindow();
  startWatching();

  globalShortcut.register("CommandOrControl+Shift+V", () => {
    win.isVisible() ? win.hide() : (win.show(), win.focus());
  });

  const trayIcon = nativeImage.createFromPath(
    path.join(__dirname, "assets", "trayIconTemplate.png"),
  );
  trayIcon.setTemplateImage(true);
  tray = new Tray(trayIcon);
  tray.setToolTip("ClipStack");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "ClipStack 열기",
      click: () => {
        win.show();
        win.focus();
      },
    },
    { type: "separator" },
    {
      label: "종료",
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("click", () => (win.isVisible() ? win.hide() : win.show()));
});

app.on("will-quit", () => globalShortcut.unregisterAll());
app.dock?.hide();
