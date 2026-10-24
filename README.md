# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Analytics

Traffic is measured with self-hosted [Umami](https://umami.is) at https://umami.mayankcodeworks.com — no cookies, no personal data.

Analytics is env-gated: it exists only when BOTH `VITE_UMAMI_SRC` and `VITE_UMAMI_ID` are non-empty at build time. They are passed as Docker build-args from the `VITE_UMAMI_*` GitHub repository variables (never committed to the repo), so local dev, tests, and CI builds without the vars run with analytics completely disabled — no script tag is injected and nothing is sent.

Events:

| Event        | Property | Fires when                                                                               |
| ------------ | -------- | ---------------------------------------------------------------------------------------- |
| `topic-open` | `topic`  | a guide topic/section view opens — route path; covers in-app navigation, direct links, and refreshes |
| `copy-code`  | `topic`  | a code example's copy button succeeds — route path of the page the block sits on          |

UTM convention for links pointing at https://reactdevelopersguide.mayankcodeworks.com (Umami parses `utm_*` query params automatically): `utm_source` = where the link lives, `utm_medium` = the kind of placement (`readme` \| `post` \| `social`). Examples:

- `https://reactdevelopersguide.mayankcodeworks.com/?utm_source=github&utm_medium=readme`
- `https://reactdevelopersguide.mayankcodeworks.com/?utm_source=reddit&utm_medium=post`
- `https://reactdevelopersguide.mayankcodeworks.com/?utm_source=dev.to&utm_medium=post`

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
