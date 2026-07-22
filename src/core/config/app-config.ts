import type { ApiScenario } from '../scenario/api-scenario';
import type { DbScenario } from '../scenario/db-scenario';

/**
 * Application configuration — mirrors the Flutter guide's `AppConfig`.
 *
 * Note (React vs Flutter): Flutter uses separate entrypoints
 * (`main_dev.dart`, `main_staging.dart`, `main_prod.dart`) each constructing an
 * `AppConfig`. React/Vite uses `.env.*` files selected by `--mode`, exposed at
 * build time via `import.meta.env`. See `src/core/config/index.ts`.
 *
 * `Environment` is a const object + literal union (not an `enum`) to stay
 * compatible with `erasableSyntaxOnly` and modern TS conventions.
 */
export const Environment = {
  Dev: 'dev',
  Staging: 'staging',
  Prod: 'prod',
} as const;

export type Environment = (typeof Environment)[keyof typeof Environment];

export interface AppConfig {
  environment: Environment;
  baseUrl: string;
  useFakeApi: boolean;
  useFakeDatabase: boolean;
  enableLogs: boolean;
  /** Dev-only failure simulation for the REST client + FakeApiService. */
  apiScenario: ApiScenario;
  /** Dev-only failure simulation for the local database + FakeAppDatabase. */
  dbScenario: DbScenario;
}

export const isDev = (c: AppConfig): boolean => c.environment === Environment.Dev;
export const isStaging = (c: AppConfig): boolean =>
  c.environment === Environment.Staging;
export const isProd = (c: AppConfig): boolean => c.environment === Environment.Prod;
