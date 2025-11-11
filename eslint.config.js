import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tsEslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/!(src|DEV_ONLY)/**/*', // Ignore everything in all directories except src
    '**/!(src|DEV_ONLY)', // Ignore all directories except src
    '!src/**/*', // Don't ignore anything in src directory
    '!DEV_ONLY/**/*', // Don't ignore anything in DEV_ONLY directory
  ]),
  eslint.configs.recommended,
  tsEslint.configs.strictTypeChecked,
  tsEslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
