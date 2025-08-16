import { app, BrowserWindow, ipcMain, nativeTheme, shell } from "electron";
import { join } from "path";

const createBrowserWindow = (): BrowserWindow => {
    const preloadScriptFilePath = join(__dirname, "..", "dist-preload", "index.js");

    return new BrowserWindow({
        height: 55, // 원하는 높이 설정 (예: 600px)
        width: 400,
        autoHideMenuBar: true,
        frame: false,
        maximizable: false, // 창 최대화 비활성화
        fullscreenable: false, // 전체 화면 전환 비활성화
        backgroundMaterial: "mica",
        vibrancy: "header",
        webPreferences: {
            preload: preloadScriptFilePath,
        },
        icon: join(__dirname, "..", "build", "app-icon-dark.png"),
    }).on("will-resize", (event) => {
        event.preventDefault(); // 창 크기 조정 시도 차단
    });
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

// URL 열기 IPC 핸들러
ipcMain.on('open-url', (_, url) => {
  shell.openExternal(url)
    .catch(err => console.error('URL을 열 수 없습니다:', err));
});