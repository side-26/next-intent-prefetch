# next-intent-prefetch

Intent-aware route and data prefetching for Next.js App Router.

`next-intent-prefetch` aims to extend the default Next.js navigation experience with configurable prefetch strategies such as hover, focus, visibility, pointer intent, and immediate warming, while preserving the native behavior of `next/link`.

> This package is currently under development.

---

## Goals

The package is designed around a simple idea:

```text
User intent
    ↓
Route prefetch
    +
Application data warming
    ↓
Faster navigation
```

Instead of mounting the destination page ahead of time, the package will allow applications to warm:

* Next.js routes
* API requests
* React Query caches
* SWR caches
* custom application caches

without triggering destination-page lifecycle behavior such as analytics, subscriptions, or `useEffect` logic.

---

## Planned API

The package will expose both declarative and imperative navigation APIs.

### SmartLink

```tsx
import { SmartLink } from 'next-intent-prefetch';

export function ProductCard() {
  return (
    <SmartLink
      href="/products/123"
      strategy="intent"
      prefetchers={[
        () => prefetchProduct('123'),
        () => prefetchReviews('123'),
      ]}
    >
      View product
    </SmartLink>
  );
}
```

### useSmartRouter

```tsx
'use client';

import { useSmartRouter } from 'next-intent-prefetch';

export function ProductButton() {
  const router = useSmartRouter();

  return (
    <button
      onMouseEnter={() => {
        void router.prefetch('/products/123', {
          prefetchers: [
            () => prefetchProduct('123'),
          ],
        });
      }}
      onClick={() => {
        router.push('/products/123');
      }}
    >
      View product
    </button>
  );
}
```

---

# Planned Features

* Preserve native Next.js `<Link>` behavior
* Preserve crawlable `<a href="">` markup
* Next.js App Router support
* Route prefetching
* Custom data prefetching
* Multiple prefetch functions
* Intent-based prefetching
* Hover prefetching
* Focus prefetching
* Pointer/touch prefetching
* Visibility-based prefetching
* Immediate prefetching
* Request deduplication
* Network-aware prefetch policies
* Imperative navigation through `useSmartRouter`
* TypeScript-first API
* React Query compatible
* SWR compatible
* Custom cache compatible
* No destination-page mounting during prefetch

---

# Project Setup

## Requirements

Recommended development environment:

```text
Node.js >= 20
pnpm >= 9
Next.js >= 15
React >= 18
TypeScript >= 5
```

The final supported Next.js and React version ranges will be defined before the first stable release.

---

# Install Dependencies

## Core Development Dependencies

Install Next.js, React, and TypeScript for local development:

```bash
pnpm add -D next react react-dom typescript @types/react @types/react-dom
```

`next`, `react`, and `react-dom` should also be declared as peer dependencies because they are provided by the consuming application.

Example:

```json
{
  "peerDependencies": {
    "next": ">=15.0.0 <17",
    "react": ">=18.2.0 <20",
    "react-dom": ">=18.2.0 <20"
  }
}
```

---

# Build System

The project uses `tsup` for packaging.

Install:

```bash
pnpm add -D tsup
```

Create:

```text
tsup.config.ts
```

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,

  external: [
    'next',
    'react',
    'react-dom',
  ],
});
```

---

# TypeScript

Create:

```text
tsconfig.json
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "DOM",
      "DOM.Iterable",
      "ES2022"
    ],

    "module": "ESNext",
    "moduleResolution": "Bundler",

    "jsx": "react-jsx",

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    "skipLibCheck": true,

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    "resolveJsonModule": true,

    "noEmit": true
  },

  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "tests/**/*.ts",
    "tests/**/*.tsx",
    "vitest.config.ts",
    "playwright.config.ts",
    "tsup.config.ts"
  ],

  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

Run type checking with:

```bash
pnpm typecheck
```

---

# Unit and Integration Testing

The project uses Vitest for:

* unit tests
* hook tests
* component tests
* lightweight integration tests

Install:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

For coverage:

```bash
pnpm add -D @vitest/coverage-v8
```

Create:

```text
vitest.config.ts
```

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',

    globals: true,

    setupFiles: [
      './tests/setup.ts',
    ],

    coverage: {
      provider: 'v8',

      reporter: [
        'text',
        'html',
      ],
    },
  },
});
```

Create:

```text
tests/setup.ts
```

```ts
import '@testing-library/jest-dom/vitest';
```

---

# End-to-End Testing

The project uses Playwright for:

* browser integration testing
* E2E testing
* navigation behavior testing
* regression testing
* real Next.js runtime testing

Install:

```bash
pnpm add -D @playwright/test
```

Install Chromium:

```bash
pnpm exec playwright install chromium
```

Create:

```text
playwright.config.ts
```

```ts
import {
  defineConfig,
  devices,
} from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI
    ? 1
    : undefined,

  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
      },
    ],
  ],

  use: {
    baseURL: 'http://localhost:3000',

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',
  },

  webServer: {
    command: 'pnpm dev:test-app',

    url: 'http://localhost:3000',

    reuseExistingServer:
      !process.env.CI,

    timeout: 120_000,
  },

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
```

---

# Prettier

Install:

```bash
pnpm add -D prettier
```

Create:

```text
.prettierrc
```

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Create:

```text
.prettierignore
```

```text
node_modules
dist
coverage
playwright-report
test-results
.next
pnpm-lock.yaml
```

---

# ESLint

Install:

```bash
pnpm add -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-import eslint-config-prettier globals
```

Create:

```text
eslint.config.mjs
```

```js
import js from '@eslint/js';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '.next/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  {
    files: [
      '**/*.{ts,tsx}',
    ],

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
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      'react/prop-types': 'off',

      '@typescript-eslint/no-explicit-any':
        'warn',

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
          allow: [
            'warn',
            'error',
          ],
        },
      ],
    },
  },

  eslintConfigPrettier,
);
```

---

# Project Structure

The initial project structure is expected to look like:

```text
next-intent-prefetch/
│
├── src/
│   ├── SmartLink.tsx
│   ├── useSmartRouter.ts
│   ├── types.ts
│   ├── internal/
│   │   ├── dedupe.ts
│   │   ├── strategy.ts
│   │   └── network-policy.ts
│   │
│   └── index.ts
│
├── tests/
│   ├── setup.ts
│   │
│   ├── unit/
│   │   ├── dedupe.test.ts
│   │   ├── strategy.test.ts
│   │   └── network-policy.test.ts
│   │
│   ├── integration/
│   │   ├── SmartLink.test.tsx
│   │   └── useSmartRouter.test.tsx
│   │
│   └── e2e/
│       ├── navigation.spec.ts
│       ├── prefetch.spec.ts
│       └── analytics.spec.ts
│
├── fixtures/
│   └── next-app/
│       ├── app/
│       ├── package.json
│       ├── tsconfig.json
│       └── next.config.ts
│
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.mjs
├── playwright.config.ts
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── package.json
├── LICENSE
└── README.md
```

---

# Package Entry Point

The public package entry point is:

```text
src/index.ts
```

Example:

```ts
export {
  SmartLink,
} from './SmartLink';

export {
  useSmartRouter,
} from './useSmartRouter';

export type {
  Prefetcher,
  PrefetchStrategy,
  SmartLinkProps,
} from './types';
```

Internal implementation details should not be exported unless they are intentionally part of the public API.

---

# package.json

A simplified package configuration could look like:

```json
{
  "name": "next-intent-prefetch",
  "version": "0.1.0",
  "description": "Intent-aware route and data prefetching for Next.js App Router.",

  "type": "module",

  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",

  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },

  "files": [
    "dist"
  ],

  "scripts": {
    "build": "tsup",

    "typecheck": "tsc --noEmit",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",

    "format": "prettier --write .",
    "format:check": "prettier --check .",

    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",

    "dev:test-app": "pnpm --dir fixtures/next-app dev"
  },

  "peerDependencies": {
    "next": ">=15.0.0 <17",
    "react": ">=18.2.0 <20",
    "react-dom": ">=18.2.0 <20"
  },

  "license": "MIT"
}
```

---

# Development Commands

Start unit tests in watch mode:

```bash
pnpm test
```

Run all unit and integration tests once:

```bash
pnpm test:run
```

Generate coverage:

```bash
pnpm test:coverage
```

Run E2E tests:

```bash
pnpm test:e2e
```

Run Playwright interactively:

```bash
pnpm test:e2e:ui
```

Type check:

```bash
pnpm typecheck
```

Lint:

```bash
pnpm lint
```

Auto-fix lint issues:

```bash
pnpm lint:fix
```

Format:

```bash
pnpm format
```

Check formatting:

```bash
pnpm format:check
```

Build the package:

```bash
pnpm build
```

---

# Testing Strategy

The project follows multiple testing layers.

```text
                 Playwright
              E2E / Regression
                    ▲
                   / \
                  /   \
             Integration
          Vitest + Testing Library
                ▲
               / \
              /   \
             Unit
            Vitest
```

## Unit

Used for pure functionality such as:

* strategy resolution
* deduplication
* network policy
* configuration normalization

## Integration

Used for:

* `SmartLink`
* `useSmartRouter`
* Next.js router mocks
* React events
* prefetch callbacks
* prop forwarding

## E2E

Used against a real Next.js application for:

* actual navigation
* route prefetching
* hover behavior
* focus behavior
* browser navigation
* modifier clicks
* SSR link output
* destination lifecycle behavior

## Regression

Playwright tests also serve as behavioral regression tests.

The project may eventually run the same E2E suite against multiple supported Next.js versions.

---

# Quality Pipeline

Before publishing, the expected validation pipeline is:

```text
Format
  ↓
Lint
  ↓
Type Check
  ↓
Unit Tests
  ↓
Integration Tests
  ↓
Build
  ↓
Package
  ↓
Install package into fixture app
  ↓
Playwright E2E / Regression Tests
```

The fixture application should eventually test the packed npm artifact rather than importing directly from `src`.

This ensures that the same package users install from npm is the package being tested.

---

# Design Principles

### Do not mount destination pages during prefetch

Prefetching should warm resources without triggering destination lifecycle behavior.

### Keep caching ownership outside this package

`next-intent-prefetch` should decide **when** to prefetch.

The application's data layer should decide **how** that data is cached.

For example:

```text
SmartLink
    ↓
decides when
    ↓
React Query / SWR / Next.js / custom cache
    ↓
decides how
```

### Preserve native navigation

`SmartLink` should continue rendering a real link and preserve:

* `href`
* accessibility
* SEO
* keyboard navigation
* open in new tab
* Cmd/Ctrl + click
* middle click
* browser history
* standard Next.js navigation behavior

### Prefetching should be opportunistic

A failed background prefetch should never prevent the user from navigating.

---

# Roadmap

Initial development goals:

* [ ] Define public TypeScript API
* [ ] Implement prefetch strategy engine
* [ ] Implement route warming
* [ ] Implement custom data prefetchers
* [ ] Implement request deduplication
* [ ] Implement `SmartLink`
* [ ] Implement `useSmartRouter`
* [ ] Add network-aware policies
* [ ] Add unit tests
* [ ] Add integration tests
* [ ] Add Next.js fixture application
* [ ] Add Playwright E2E tests
* [ ] Add regression tests
* [ ] Add GitHub Actions
* [ ] Test packed npm artifact
* [ ] Publish first beta release

---

# Contributing

The project is currently in its early development stage.

Issues, feature discussions, bug reports, tests, and pull requests will be welcome once the initial public API is stabilized.

---

# License

MIT © 2026
