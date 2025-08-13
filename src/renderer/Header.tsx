import { Avatar, Input, Text } from "@fluentui/react-components";
import { SearchRegular } from "@fluentui/react-icons";
import { useState } from "react";

export const Header = () => {
    const [command, setCommand] = useState("");

    // 명령어 입력 핸들러
    const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommand(e.target.value);
    };

    // 엔터 키 입력 시 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && command) {
            // Electron 메인 프로세스에 명령어 전달
            // if (window.electron) {
            //     window.electron.ipcRenderer.send("execute-command", command);
            // }
            // console.log("Hello World");
            // alert(command);
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