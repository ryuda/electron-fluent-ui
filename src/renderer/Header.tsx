import { Avatar, Input, Text } from "@fluentui/react-components";
import { SearchRegular } from "@fluentui/react-icons";
import { useState } from "react";

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

export const Header = () => {
    const [command, setCommand] = useState("");

    // 명령어 입력 핸들러
    const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommand(e.target.value);
    };

    // 엔터 키 입력 시 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && command) {
            // URL 형식 검증
            let url = command;

            // URL에 프로토콜이 없으면 http:// 추가
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            try {
                // URL이 유효한지 확인
                new URL(url);

                // Electron 환경에서 실행 중인 경우 IPC를 통해 URL 열기
                if (window.electron) {
                    window.electron.ipcRenderer.send("open-url", url);
                } else {
                    // 일반 브라우저 환경에서는 window.open 사용
                    window.open(url, '_blank');
                }

                // 입력 필드 초기화
                setCommand("");
            } catch (_error) {
                // 유효하지 않은 URL인 경우 경고 표시
                alert("유효하지 않은 URL입니다: " + command);
            }
        }
    };

    console.log("JK> Header Render");
    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
            }}
        >
            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", WebkitAppRegion: "no-drag" }}>
                <Input
                    autoFocus
                    width={"100%"}
                    contentBefore={<SearchRegular />}
                    placeholder="무엇을 도와드릴까요?"
                    appearance="filled-darker"
                    value={command}
                    onChange={handleCommandChange}
                    onKeyDown={handleKeyDown} // 엔터 키 이벤트 처리
                />
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
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
    );
};