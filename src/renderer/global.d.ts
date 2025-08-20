import "react";

declare module "react" {
    interface CSSProperties {
        WebkitAppRegion?: string;
    }
}

declare global {
    interface Window {
        electron?: {
            ipcRenderer: {
                send: (channel: string, ...args: unknown[]) => void;
                on: (channel: string, callback: (...args: unknown[]) => void) => void;
            };
            tooltip?: {
                show: (options: {
                    x: number;
                    y: number;
                    content: string;
                    width?: number;
                    height?: number;
                }) => void;
                hide: () => void;
            };
        };
        ContextBridge: {
            onNativeThemeChanged: (callback: () => void) => void;
        };
    }
}

export {};