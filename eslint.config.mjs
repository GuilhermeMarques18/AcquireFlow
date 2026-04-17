import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default ts.config(
    js.configs.recommended,
    ...ts.configs.recommended,
{
    plugins: {
        prettier: prettierPlugin,
    },
    rules: {
        "prettier/prettier": "error",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
    },
},
    prettier,
{
    ignores: ["node_modules/", "dist/", "build/"],
}
);