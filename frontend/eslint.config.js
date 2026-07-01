// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', 'coverage/*'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'import/no-unresolved': 'off',
    },
  },
]);
