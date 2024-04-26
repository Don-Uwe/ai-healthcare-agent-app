module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
    'object-shorthand': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-children-prop': 'off',
    '@typescript-eslint/no-unused-vars': 'warn', // if it's import var, tree-shaking will remove safely and ctrl+shift+O will auto delete unused import. And this rule is unnecessary for Debug
    '@typescript-eslint/no-empty-interface': 'off', // during Dev, you may want build a temp component who's props extends another exist, and detail develop it is future. but, this lint will prevent you to do that. so, it's not a development friendly rule. it's a troublemaker
    'react/display-name': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/prop-types': 'off',
    'typescript-eslint/ban-types': 0,
    'no-async-promise-executor': 'warn',
    'prefer-const': 'warn'
  }
}
