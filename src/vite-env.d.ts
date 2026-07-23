/// <reference types="vite/client" />

/**
 * Narrow the `VITE_*` env vars (Vite's default `ImportMetaEnv` index signature
 * types them as `any`) to `string | undefined` so config parsing is type-checked.
 * Vite only exposes `VITE_`-prefixed vars to client code.
 */
interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string;
  readonly VITE_USE_FAKE_API?: string;
  readonly VITE_USE_FAKE_DB?: string;
  readonly VITE_ENABLE_LOGS?: string;
  readonly VITE_API_SCENARIO?: string;
  readonly VITE_DB_SCENARIO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
