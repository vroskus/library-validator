import eslintConfig from '@vroskus/eslint-config';

export default eslintConfig.node({
  rules: {
    complexity: ['error', 5],
  },
});
