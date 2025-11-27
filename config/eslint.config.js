import { createEslintConfig } from '@planttheidea/build-tools';

export default createEslintConfig({
  config: 'config',
  configs: [
    {
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
      },
    },
  ],
  development: 'dev',
  react: true,
  source: 'src',
});
