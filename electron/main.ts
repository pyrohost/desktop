import { app, BrowserView, BrowserWindow } from "electron";
import contextMenu from "electron-context-menu";
import path from "node:path";

process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    autoHideMenuBar: true,
    frame: false,
    width: 1200,
    height: 800,
    backgroundColor: "#000000",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: "#ffffff",
      height: 28,
    },
  });

  const view = new BrowserView();
  win.addBrowserView(view);
  view.setBounds({ x: 0, y: 28, width: 1200, height: 800 - 28 });
  view.setAutoResize({ width: true, height: true });
  view.setBackgroundColor("#000000");
  view.webContents.loadURL("https://panel.pyro.host");

  view.webContents.on("did-finish-load", () => {
    contextMenu({ window: view, prepend: () => [] });
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  view.webContents.setWindowOpenHandler((details) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("electron").shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
