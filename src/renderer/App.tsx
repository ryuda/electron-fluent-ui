import { Button, FluentProvider, Text, type Theme, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";
import { Header } from "./Header";

const shouldUseDarkColors = (): boolean =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const getTheme = () => (shouldUseDarkColors() ? webDarkTheme : webLightTheme);

export const App = () => {
    const [theme, setTheme] = useState<Theme>(getTheme());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [windowHeight, setWindowHeight] = useState<number>(55);
    const [showHeader, setShowHeader] = useState<boolean>(true);
    const webviewRef = useRef<Electron.WebviewTag>(null);

    // Header의 엔터 키 입력 이벤트 처리
    const handleHeaderEnter = (keyword: string) => {
        console.log("JK> handleHeaderEnter", keyword);
        // 웹뷰의 URL 변경
        if (webviewRef.current && keyword) {
            webviewRef.current.src = "https://google.com/search?q=" + keyword;
        }

        // 창 크기 변경 및 Header 숨기기
        window.electron?.ipcRenderer.send("resize-window-height", 550);
        document.dispatchEvent(new CustomEvent("window-resize", { detail: { height: 550 } }));
    };

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        window.ContextBridge.onNativeThemeChanged(() => setTheme(getTheme()));

        // 창 크기 변경 감지를 위한 리스너 설정
        const handleWindowResize = (event: CustomEvent) => {
            const height = event.detail?.height;
            if (height) {
                setWindowHeight(height);
                // 창 높이가 550이면 Header 숨기기
                setShowHeader(height <= 55);
            }
        };

        // 사용자 정의 이벤트 리스너 등록
        document.addEventListener("window-resize", handleWindowResize as EventListener);

        // 창 닫기 이벤트 처리 (창이 작아질 때 Header 다시 표시)
        document.addEventListener("window-close-event", () => {
            setWindowHeight(55);
            setShowHeader(true);
        });

        // 툴팁 클릭 이벤트 처리 (handleHeaderEnter 호출)
        if (window.electron?.ipcRenderer) {
            console.log("JK> 이벤트 리스너 등록: tooltip-execute-search");
            window.electron.ipcRenderer.on("tooltip-execute-search", (keyword) => {
                console.log("JK> 툴팁 검색 실행:", keyword);
                // 직접 handleHeaderEnter 함수 호출
                handleHeaderEnter(keyword as string);
                alert("툴팁 검색 실행");
            });
        }


        // 앱이 시작될 때 툴팁 표시 (지연 적용)
        const tooltipTimer = setTimeout(() => {
            if (window.electron?.tooltip) {
                // 창의 위치에 기반하여 툴팁 위치 계산
                const x = Math.round(window.screenX + 10);
                const y = Math.round(window.screenY - 121); // 메인 창 위에 표시

                window.electron.tooltip.show({
                    x,
                    y,
                    content: `
                        <div style="text-align: center;">
                            <h3 style="margin-top: 0;">i-ERP 안내</h3>
                            <p>검색창에 원하는 내용을 입력하고 엔터 키를 누르면,<br/>
                               검색 결과가 표시됩니다.
                            </p>
                            <p style="font-size: 12px; margin-bottom: 0; color: #aaa;">이 툴팁을 클릭하면 검색이 실행됩니다</p>
                        </div>
                    `,
                    width: 430,
                    height: 110
                });
            }
        }, 500); // 0.5초 후 표시

        return () => {
            document.removeEventListener("window-resize", handleWindowResize as EventListener);
            document.removeEventListener("window-close-event", () => {});
            clearTimeout(tooltipTimer); // 타이머 정리
        };
    }, []);

    // 창 닫기 핸들러
    const handleClose = () => {
        if (windowHeight > 55) {
            // 창이 확장된 상태면 원래 크기로 줄이고 Header 표시
            window.electron?.ipcRenderer.send("window-close");
            document.dispatchEvent(new CustomEvent("window-close-event"));
        } else {
            // 이미 작은 상태면 앱 종료
            window.electron?.ipcRenderer.send("app-quit");
        }
    };

    // 창 최소화 핸들러
    const handleMinimize = () => {
        window.electron?.ipcRenderer.send("window-minimize");
    };

    return (
        <FluentProvider theme={theme} style={{ height: "100vh", background: "transparent", WebkitAppRegion: "drag" }}>
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    borderRadius: "20px",
                    overflow: "hidden",
                    position: "relative", // 상대적 위치 설정
                    WebkitAppRegion: "drag", // 창 드래그 가능하게 설정
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
                    }}
                >
                    <div style={{ paddingLeft: "10px" }}>
                        <Text weight="semibold">i-ERP</Text>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            WebkitAppRegion: "no-drag", // 버튼은 드래그에서 제외
                        }}
                    >
                        <Button
                            appearance="subtle"
                            icon={<span style={{ fontSize: "16px" }}>─</span>}
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
                        src="https://www.google.com" // 초기 URL
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "8px",
                            overflow: "hidden",
                            WebkitAppRegion: "no-drag",
                        }}
                        allowpopups="true"
                    />
                </div>

                {/* Header 컴포넌트를 화면 맨 아래에 배치 - 조건부 렌더링 */}
                {showHeader && (
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
                        <Header onEnter={handleHeaderEnter} />
                    </div>
                )}
            </div>
        </FluentProvider>
    );
};