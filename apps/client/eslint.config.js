const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Expo SDK 57의 flat config를 그대로 확장하고 생성물만 검사 대상에서 제외한다.
module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/**', '.expo/**'],
  },
]);
