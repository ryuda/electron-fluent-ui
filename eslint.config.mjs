import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    ...tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended),
    {
        ignores: ["dist-main/", "dist-preload/", "dist-renderer/", "node_modules/", "**/coverage/"],
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            // 미사용 변수 규칙: 언더스코어로 시작하면 무시
            '@typescript-eslint/no-unused-vars': ['warn', {
                varsIgnorePattern: '^_',
                argsIgnorePattern: '^_',
                caughtErrors: 'all',
                caughtErrorsIgnorePattern: '^_', // ← catch ( _error ) 무시
            }],
        },
    },

];
