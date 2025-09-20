// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import pluginImport from "eslint-plugin-import";
import unused from "eslint-plugin-unused-imports";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      import: pluginImport,
      "unused-imports": unused,
    },
    rules: {
      // базовые рекомендации
      ...js.configs.recommended.rules,

      // 🔒 Импорты должны указывать расширение в браузерных ESM
      "import/extensions": ["error", "always", { ignorePackages: true }],

      // Проверка существования файлов и корректности путей
      "import/no-unresolved": [
        "error",
        { commonjs: false, caseSensitive: true },
      ],

      // Предупреждения про порядок импортов (по желанию)
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],

      // Убираем мусорные импорты/переменные
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
    settings: {
      "import/resolver": {
        // node-резолвер поймёт .js и .mjs
        node: { extensions: [".js", ".mjs"] },
      },
    },
  },
];
