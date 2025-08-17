import {
    Avatar,
    Button,
    FluentProvider,
    Text,
    webDarkTheme,
    webLightTheme,
    type Theme,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { Header } from "./Header";

const shouldUseDarkColors = (): boolean =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const getTheme = () => (shouldUseDarkColors() ? webDarkTheme : webLightTheme);

// Electron 렌더러 프로세스의 window 객체에 대한 타입 확장
declare global {
    interface Window {
        electron?: {
            ipcRenderer: {
                send: (channel: string, ...args: unknown[]) => void;
            };
        };
        ContextBridge: {
            onNativeThemeChanged: (callback: () => void) => void;
        };
    }
}

export const App = () => {
    const [theme, setTheme] = useState<Theme>(getTheme());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const webviewRef = useRef<Electron.WebviewTag>(null);

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        window.ContextBridge.onNativeThemeChanged(() => setTheme(getTheme()));
    }, []);

    // 창 닫기 핸들러
    const handleClose = () => {
        window.electron?.ipcRenderer.send("window-close");
    };

    // 창 최소화 핸들러
    const handleMinimize = () => {
        window.electron?.ipcRenderer.send("window-minimize");
    };

    return (
        <FluentProvider theme={theme} style={{ height: "100vh", background: "transparent" }}>
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    borderRadius: "20px",
                    overflow: "hidden",
                    position: "relative", // 상대적 위치 설정
                }}
            >
                {/* 창 타이틀바 */}
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "32px",
                        backgroundColor: theme.colorNeutralBackground2,
                        WebkitAppRegion: "drag", // 창 드래그 가능하게 설정
                    }}
                >
                    <div style={{ paddingLeft: "10px" }}>
                        <Text weight="semibold">SK 검색</Text>
                    </div>
                    <div style={{ 
                        display: "flex", 
                        WebkitAppRegion: "no-drag" // 버튼은 드래그에서 제외
                    }}>
                        <Button 
                            appearance="subtle" 
                            icon={<span style={{fontSize: "16px"}}>─</span>} 
                            onClick={handleMinimize} 
                            style={{ minWidth: "40px", height: "32px" }}
                            aria-label="최소화"
                        />
                        <Button 
                            appearance="subtle" 
                            icon={<Dismiss24Regular />} 
                            onClick={handleClose} 
                            style={{ minWidth: "40px", height: "32px" }}
                            aria-label="닫기"
                        />
                    </div>
                </div>

                {/* 메인 콘텐츠 영역 */}
                <div
                    style={{
                        flex: 1, // 남은 공간을 모두 차지
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        padding: 10,
                        boxSizing: "border-box",
                    }}
                >
                    {/* webview로 브라우저 표시 */}
                    <webview
                        ref={webviewRef}
                        src="https://www.google.com" // 초기 URL (Chrome 내부 페이지는 직접 접근이 제한됨)
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "8px",
                            overflow: "hidden",
                        }}
                        allowpopups="true"
                    />
                </div>

                {/* Header 컴포넌트를 화면 맨 아래에 배치 */}
                <div
                    style={{
                        width: "100%",
                        position: "fixed", // 고정 위치 설정
                        bottom: 0, // 화면 맨 아래에 배치
                        left: 0,
                        padding: 10,
                        boxSizing: "border-box",
                        backgroundColor: theme.colorNeutralBackground1, // 배경색 설정
                        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)", // 위쪽 그림자 추가
                        zIndex: 100, // 다른 요소 위에 표시
                    }}
                >
                    <Header />
                </div>
            </div>
        </FluentProvider>
    );
};