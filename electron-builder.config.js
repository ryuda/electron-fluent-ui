/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const baseConfig = {
    appId: "com.electron.fluentui",
    productName: "Electron Fluent UI",
    directories: {
        output: "release",
        buildResources: "build",
    },
    files: ["dist-main/index.js", "dist-preload/index.js", "dist-renderer/**/*"],
    extraMetadata: { version: process.env.VITE_APP_VERSION },
    artifactName: "${productName}-${version}-${os}-${arch}.${ext}", // 선택
};

/**
 * @type {Record<NodeJS.Platform, import('electron-builder').Configuration>}
 */
const platformSpecificConfigurations = {
    darwin: {
        ...baseConfig,
        mac: {
            icon: "build/app-icon-dark.png",
            target: [{ target: "zip" }], // dmg 필요 없으면 zip만
        },
    },
    win32: {
        ...baseConfig,
        // ★ appx 설정은 제거(또는 주석 처리) ★
        // appx: { ... }  // ← 삭제
        win: {
            icon: "build/app-icon-dark.png",
            target: [{ target: "portable" }], // ← 핵심: 포터블 EXE
        },
    },
    linux: {
        ...baseConfig,
        linux: {
            category: "Utility",
            icon: "build/app-icon-dark.png",
            target: [{ target: "zip" }], // 필요 시 다른 포맷 추가
        },
    },
};

module.exports = platformSpecificConfigurations[process.platform];
