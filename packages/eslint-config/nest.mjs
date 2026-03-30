export const nestConfig = [
  {
    files: ['apps/api/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: [
      'apps/api/src/**/*.service.ts',
      'apps/api/src/**/*.controller.ts',
      'apps/api/src/**/*.module.ts',
      'apps/api/src/**/*.guard.ts',
      'apps/api/src/**/*.interceptor.ts',
      'apps/api/src/**/*.filter.ts',
      'apps/api/src/**/*.middleware.ts',
      'apps/api/src/**/*.health.ts',
    ],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
