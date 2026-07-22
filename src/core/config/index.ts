import { Environment, type AppConfig } from './app-config';
import { ApiScenario } from '../scenario/api-scenario';
import { DbScenario } from '../scenario/db-scenario';

/**
 * Build the AppConfig from Vite env vars. Vite selects `.env.<mode>` based on
 * `--mode` (dev → development, build → production, `--mode staging` → staging).
 *
 * `VITE_*` prefixed vars are the only ones exposed to client code.
 */
function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

function resolveEnvironment(mode: string): Environment {
  switch (mode) {
    case 'staging':
      return Environment.Staging;
    case 'production':
      return Environment.Prod;
    case 'development':
    default:
      return Environment.Dev;
  }
}

export function createAppConfig(
  env: ImportMetaEnv = import.meta.env,
): AppConfig {
  const environment = resolveEnvironment(env.MODE);

  return {
    environment,
    baseUrl: env.VITE_BASE_URL ?? 'https://jsonplaceholder.typicode.com',
    // Fakes + failure injection are dev-only conveniences.
    useFakeApi:
      environment === Environment.Dev
        ? parseBoolean(env.VITE_USE_FAKE_API, true)
        : false,
    useFakeDatabase:
      environment === Environment.Dev
        ? parseBoolean(env.VITE_USE_FAKE_DB, true)
        : false,
    enableLogs: parseBoolean(env.VITE_ENABLE_LOGS, environment !== Environment.Prod),
    apiScenario:
      (env.VITE_API_SCENARIO as ApiScenario | undefined) ?? ApiScenario.Success,
    dbScenario:
      (env.VITE_DB_SCENARIO as DbScenario | undefined) ?? DbScenario.Success,
  };
}
