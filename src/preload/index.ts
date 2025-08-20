import type { ContextBridge } from "@common/ContextBridge";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ContextBridge", <ContextBridge>{
    onNativeThemeChanged: (callback: () => void) => ipcRenderer.on("nativeThemeChanged", callback),
    themeShouldUseDarkColors: () => ipcRenderer.sendSync("themeShouldUseDarkColors"),
});

contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => {
            // 유효한 채널 목록에 툴팁 관련 채널 추가
            const validChannels = [
                "resize-window-height",
                "window-minimize",
                "window-close",
                "app-quit",
                "show-tooltip",
                "hide-tooltip",
                "tooltip-clicked",
                "open-external-url" // 외부 URL 열기 채널 추가
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, ...args);
            }
        },
        on: (channel: string, callback: (...args: unknown[]) => void) => {
            const validChannels = ["tooltip-execute-search"];
            if (validChannels.includes(channel)) {
                // 이벤트 핸들러 등록
                ipcRenderer.on(channel, (_, ...args) => callback(...args));
            }
        }
    },
    // 툴팁 관련 편의 함수 추가
    tooltip: {
        show: (params: { x: number, y: number, content: string, width?: number, height?: number }) => {
            const tooltipParams = {
                x: params.x,
                y: params.y,
                content: params.content,
                width: params.width || 200,
                height: params.height || 100
            };
            ipcRenderer.send("show-tooltip", tooltipParams);
        },
        hide: () => {
            ipcRenderer.send("hide-tooltip");
        }
    }
});