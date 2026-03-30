import eslintConfigPrettier from 'eslint-config-prettier';
import { baseConfig } from './packages/eslint-config/base.mjs';
import { reactConfig } from './packages/eslint-config/react.mjs';
import { nestConfig } from './packages/eslint-config/nest.mjs';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.d.ts',
    ],
  },

  ...baseConfig,
  ...reactConfig,
  ...nestConfig,
  eslintConfigPrettier,
];
