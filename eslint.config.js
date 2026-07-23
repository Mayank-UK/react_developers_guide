import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // Type-aware ruleset: catches unsafe assignments, floating promises,
      // unsafe argument types, etc. Uses project service to read tsconfigs.
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Turned off because they conflict with idiomatic React + teaching code,
      // not because they're bad rules:
      //  - no-confusing-void-expression flags every `() => setState(...)`
      //    event handler (the canonical React pattern).
      //  - restrict-template-expressions flags `${someNumber}` interpolation,
      //    which is pervasive and intentional in a docs/teaching app.
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    // Test files: RTL's getAllByX()[i] indexing legitimately uses non-null
    // assertions, and jsdom's types differ from runtime (e.g. textContent),
    // making some defensive conditions/optional chains "unnecessary" to the
    // type checker but correct in practice. Relax those here only.
    files: ['**/*.spec.ts', '**/*.spec.tsx', 'src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    // The router module declares lazy() components alongside route-data exports
    // (routes, router, createAppRouter). That's a route table, not a Fast
    // Refresh boundary, so the react-refresh rule doesn't apply here.
    files: ['src/ui/routing/router.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
