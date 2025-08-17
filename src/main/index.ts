import { app, BrowserWindow, ipcMain, nativeTheme, screen, shell } from "electron";
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

// 툴팁 윈도우 참조 변수
let tooltipWindow: BrowserWindow | null = null;

// 툴팁 윈도우 생성 함수 수정
const createTooltipWindow = (params: { x: number, y: number, content: string, width: number, height: number }): BrowserWindow => {
    // 기존 툴팁이 있으면 닫기
    if (tooltipWindow && !tooltipWindow.isDestroyed()) {
        tooltipWindow.close();
    }

    // 툴팁 윈도우 생성
    const tooltipWin = new BrowserWindow({
        x: params.x,
        y: params.y,
        width: params.width,
        // 화살표 부분을 고려하여 높이 약간 증가
        height: params.height + 15,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        resizable: false,
        movable: false,
        alwaysOnTop: true,
        show: false,
        autoHideMenuBar: true,
        roundedCorners: true,
        webPreferences: {
            preload: join(__dirname, "..", "dist-preload", "index.js"),
        },
    });

    // HTML 콘텐츠 설정 - 말풍선 스타일 적용
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                overflow: hidden;
                background-color: transparent;
            }
        
            .tooltip-container {
                position: relative;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
            }
            
            .tooltip-content {
                position: relative;
                margin: 0;
                padding: 15px;
                background-color: rgba(50, 50, 50, 0.9);
                color: white;
                font-family: 'Segoe UI', sans-serif;
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.8);
                cursor: pointer;
                width: 100%;
                height: calc(100% - 15px);
                box-sizing: border-box;
            }
            
            /* 말풍선 화살표 - 하단 중앙에 위치 */
            .tooltip-content:after {
                content: '';
                position: absolute;
                bottom: -10px;
                left: 50%;
                margin-left: -10px;
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-top: 10px solid rgba(50, 50, 50, 0.9);
            }
        </style>
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                document.querySelector('.tooltip-container').addEventListener('click', () => {
                    window.electron.tooltip.hide();
                });
            });
        </script>
    </head>
    <body>
        <div class="tooltip-container">
            <div class="tooltip-content">
                ${params.content}
            </div>
        </div>
    </body>
    </html>
    `;

    // 데이터 URL로 로드
    tooltipWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // 준비되면 표시
    tooltipWin.once('ready-to-show', () => {
        tooltipWin.show();
    });

    tooltipWindow = tooltipWin;
    return tooltipWin;
};

// IPC 이벤트 리스너 등록 함수에 툴팁 관련 이벤트 추가
const registerIpcEventListeners = () => {
    ipcMain.on("themeShouldUseDarkColors", (event: IpcMainEvent) => {
        event.returnValue = nativeTheme.shouldUseDarkColors;
    });

    // 툴팁 표시 이벤트
    ipcMain.on("show-tooltip", (_, params) => {
        createTooltipWindow(params);
    });

    // 툴팁 닫기 이벤트
    ipcMain.on("hide-tooltip", () => {
        if (tooltipWindow && !tooltipWindow.isDestroyed()) {
            tooltipWindow.close();
            tooltipWindow = null;
        }
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