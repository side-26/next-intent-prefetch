import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // -------------------------------------------------------------------------
  // Global ignores
  // -------------------------------------------------------------------------

  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '.next/**',
      'fixtures/next-app/.next/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  // -------------------------------------------------------------------------
  // JavaScript
  // -------------------------------------------------------------------------

  {
    files: ['**/*.{js,mjs,cjs}'],

    ...js.configs.recommended,

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },

    rules: {
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // TypeScript base
  // -------------------------------------------------------------------------

  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,

    files: ['**/*.{ts,tsx}'],
  })),

  // -------------------------------------------------------------------------
  // TypeScript project configuration
  // -------------------------------------------------------------------------

  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parserOptions: {
        projectService: true,

        tsconfigRootDir: import.meta.dirname,
      },

      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      import: importPlugin,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],

          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // Prettier must remain last
  // -------------------------------------------------------------------------

  eslintConfigPrettier,
);
