import {
    Avatar,
    Input,
    Text,
    Button
} from "@fluentui/react-components";
import { SearchRegular, InfoRegular } from "@fluentui/react-icons";
import { useEffect, useState, useRef } from "react";

// Electron 렌더러 프로세스의 window 객체에 대한 타입 확장
declare global {
    interface Window {
        electron?: {
            ipcRenderer: {
                send: (channel: string, ...args: unknown[]) => void;
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
    }
}

interface HeaderProps {
    onEnter?: (keyword: string) => void;
}

export const Header = ({ onEnter }: HeaderProps) => {
    const [command, setCommand] = useState("");
    const [keyword, setKeyword] = useState<string>("");
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    // 디버깅을 위해 상태 변화 로깅
    useEffect(() => {
        if (keyword && onEnter) {
            onEnter(keyword);
        }
    }, [keyword, onEnter]);

    // 툴팁 상태 관리를 위한 effect
    useEffect(() => {
        // 문서 클릭 시 툴팁 닫기
        const handleDocumentClick = () => {
            if (tooltipVisible) {
                window.electron?.tooltip?.hide();
                setTooltipVisible(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);
        
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [tooltipVisible]);

    // 명령어 입력 핸들러
    const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommand(e.target.value);
    };

    // 엔터 키 입력 시 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && command.trim()) {
            e.preventDefault(); // 기본 동작 방지
            console.log("엔터 키 감지됨, 명령어:", command);
            // URL 형식 검증
            // let processedUrl = command;

            // URL에 프로토콜이 없으면 https:// 추가
            // if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            //     processedUrl = 'https://' + processedUrl;
            // }

            // URL 상태 업데이트
            setKeyword(command);

            // 창 크기 조정 메시지 전송
            window.electron?.ipcRenderer.send("resize-window-height", 550);

            // 입력 필드 초기화
            setCommand("");
        }
    };

    // 툴팁 표시 함수
    const showTooltip = (e: React.MouseEvent) => {
        e.stopPropagation(); // 이벤트 전파 방지
        
        if (headerRef.current && window.electron?.tooltip) {
            const rect = headerRef.current.getBoundingClientRect();
            
            // 헤더 상단에 툴팁 표시
            const x = Math.round(window.screenX + 10);
            const y = Math.round(window.screenY - 133); // 메인 창 위에 표시
            
            window.electron.tooltip.show({
                x,
                y,
                content: `
                    <div style="text-align: center;">
                        <h3 style="margin-top: 0;">도움말</h3>
                        <p>검색창에 원하는 내용을 입력하고 엔터 키를 누르세요.</p>
                        <p style="font-size: 12px; margin-bottom: 0; color: #aaa;">클릭하면 닫힙니다</p>
                    </div>
                `,
                width: 430,
                height: 100
            });

            setTooltipVisible(true);
        }
    };

    return (
        <div ref={headerRef}>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div style={{ flexGrow: 1, display: "flex", flexDirection: "row" }}>
                    <Input
                        autoFocus
                        contentBefore={<SearchRegular />}
                        // contentAfter={
                        //     <Button
                        //         appearance="transparent"
                        //         size="small"
                        //         icon={<InfoRegular />}
                        //         onClick={showTooltip}
                        //         style={{ WebkitAppRegion: "no-drag" }}
                        //         aria-label="도움말"
                        //     />
                        // }
                        placeholder="무엇을 도와드릴까요?"
                        appearance="filled-darker"
                        value={command}
                        onChange={handleCommandChange}
                        onKeyDown={handleKeyDown}
                        style={{ WebkitAppRegion: "no-drag", width: "95%", marginLeft: "5px", borderRadius: 12}}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        webkitAppRegion: "drag"
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <Text size={200} align="end" style={{ webkitAppRegion: "drag" }}>
                            Sk {/*Hynix*/}
                        </Text>
                        <Text size={100} align="end" style={{ webkitAppRegion: "drag" }}></Text>
                    </div>
                    <Avatar size={36} name="S K" color="red" style={{ backgroundColor: "orange" }} />
                </div>
            </div>
        </div>
    );
};