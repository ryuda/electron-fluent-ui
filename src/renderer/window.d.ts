import type { ContextBridge } from "@common/ContextBridge";

export declare global {
    interface Window {
        ContextBridge: ContextBridge;
        electron: {
            ipcRenderer: {
                send: (channel: string, ...args: any[]) => void;
            };
            tooltip: {
                show: (params: { 
                    x: number, 
                    y: number, 
                    content: string, 
                    width?: number, 
                    height?: number 
                }) => void;
                hide: () => void;
            };
        };
    }
}