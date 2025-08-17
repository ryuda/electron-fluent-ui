import { app, BrowserWindow, ipcMain, nativeTheme, shell } from "electron";
import { join } from "path";
import IpcMainEvent = Electron.IpcMainEvent;


let mainWindow: BrowserWindow | null = null;

const createBrowserWindow = (): BrowserWindow => {
    const preloadScriptFilePath = join(__dirname, "..", "dist-preload", "index.js");

    const window = new BrowserWindow({
        height: 55,
        width: 450,
        autoHideMenuBar: true,
        frame: false,
        maximizable: false,
        fullscreenable: false,
        backgroundMaterial: "mica",
        vibrancy: "header",
        webPreferences: {
            preload: preloadScriptFilePath,
            webviewTag: true, // webview 태그 활성화
            // nodeIntegration: true, // 노드 통합 활성화
            // contextIsolation: false, // 컨텍스트 격리 비활성화

        },
        icon: join(__dirname, "..", "build", "app-icon-dark.png"),
    }).on("will-resize", (event) => {
        event.preventDefault();
    });

    mainWindow = window;
    return window;
};

const loadFileOrUrl = (browserWindow: BrowserWindow) => {
    if (process.env.VITE_DEV_SERVER_URL) {
        browserWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        browserWindow.loadFile(join(__dirname, "..", "dist-renderer", "index.html"));
    }
};

const registerIpcEventListeners = () => {
    ipcMain.on("themeShouldUseDarkColors", (event: IpcMainEvent) => {
        event.returnValue = nativeTheme.shouldUseDarkColors;
    });
};

const registerNativeThemeEventListeners = (allBrowserWindows: BrowserWindow[]) => {
    nativeTheme.addListener("updated", () => {
        for (const browserWindow of allBrowserWindows) {
            browserWindow.webContents.send("nativeThemeChanged");
        }
    });
};

(async () => {
    await app.whenReady();
    const mainWindow = createBrowserWindow();
    loadFileOrUrl(mainWindow);
    registerIpcEventListeners();
    registerNativeThemeEventListeners(BrowserWindow.getAllWindows());
    // mainWindow.webContents.openDevTools();
})();

// 다른 코드...
ipcMain.on("resize-window-height", (_, height: number) => {
    console.log("JK> 리스너 resize-window-height");
    if (mainWindow) {
        const [width] = mainWindow.getSize();
        // console.log(width, height);
        mainWindow.setSize(width, height);
    }
});

ipcMain.on("window-close", () => {
    console.log("JK> 리스너 window-close");
    if (mainWindow) {
        // mainWindow.close();
        const [width] = mainWindow.getSize();
        mainWindow.setSize(width, 55);
    }
});

ipcMain.on("window-minimize", () => {
    console.log("JK> 리스너 window-minimize");
    if (mainWindow) {
        mainWindow.minimize();
    }
});

// 앱 종료 이벤트 핸들러
ipcMain.on("app-quit", () => {
    console.log("JK> 리스너 app-quit");
    app.quit();
});
