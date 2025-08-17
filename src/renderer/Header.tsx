import {
    Avatar,
    Button,
    Dialog,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Input,
    makeStyles,
    Spinner,
    Text
} from "@fluentui/react-components";
import { Dismiss24Regular, SearchRegular } from "@fluentui/react-icons";
import { useEffect, useRef, useState } from "react";

// Electron 렌더러 프로세스의 window 객체에 대한 타입 확장
declare global {
    interface Window {
        electron?: {
            ipcRenderer: {
                send: (channel: string, ...args: unknown[]) => void;
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

    // 디버깅을 위해 상태 변화 로깅
    useEffect(() => {
        if (keyword && onEnter) {
            onEnter(keyword);
        }
    }, [keyword, onEnter]);

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

    return (
        <>
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
                        <Text size={200} align="end">
                            Sk {/*Hynix*/}
                        </Text>
                        <Text size={100} align="end"></Text>
                    </div>
                    <Avatar size={36} name="S K" color="red" style={{ backgroundColor: "orange" }} />
                </div>
            </div>
        </>
    );
};