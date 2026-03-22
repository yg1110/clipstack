const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("clipboardAPI", {
  onHistoryUpdate: (callback) =>
    ipcRenderer.on("history-update", (_, data) => callback(data)),
  copyItem: (text) => ipcRenderer.send("copy-item", text),
  clearHistory: () => ipcRenderer.send("clear-history"),
  deleteItem: (text) => ipcRenderer.send("delete-item", text),
  quitApp: () => ipcRenderer.send("quit-app"),
  hideWindow: () => ipcRenderer.send("hide-window"),
});
