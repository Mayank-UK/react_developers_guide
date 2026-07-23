import { Environment, type AppConfig } from './app-config';
import { ApiScenario, API_SCENARIOS, type ApiScenario as ApiScenarioType } from '../scenario/api-scenario';
import { DbScenario, DB_SCENARIOS, type DbScenario as DbScenarioType } from '../scenario/db-scenario';

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

/**
 * Resolve the runtime environment from the Vite mode. Unknown modes throw
 * (rather than silently falling through to Dev, which would enable fakes and
 * failure injection in an environment that didn't ask for them).
 */
function resolveEnvironment(mode: string): Environment {
  switch (mode) {
    case 'staging':
      return Environment.Staging;
    case 'production':
      return Environment.Prod;
    case 'development':
    case 'test':
      return Environment.Dev;
    default:
      throw new Error(
        `Unknown Vite mode "${mode}"; expected development|staging|production|test.`,
      );
  }
}

/** Parse + validate a scenario env var against its allowed literal set. */
function parseApiScenario(value: string | undefined): ApiScenarioType {
  if (value === undefined) return ApiScenario.Success;
  const match = API_SCENARIOS.find((s) => s === value);
  if (!match) {
    throw new Error(
      `Invalid VITE_API_SCENARIO "${value}"; expected one of ${API_SCENARIOS.join(', ')}.`,
    );
  }
  return match;
}

function parseDbScenario(value: string | undefined): DbScenarioType {
  if (value === undefined) return DbScenario.Success;
  const match = DB_SCENARIOS.find((s) => s === value);
  if (!match) {
    throw new Error(
      `Invalid VITE_DB_SCENARIO "${value}"; expected one of ${DB_SCENARIOS.join(', ')}.`,
    );
  }
  return match;
}

export function createAppConfig(env: ImportMetaEnv = import.meta.env): AppConfig {
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
    apiScenario: parseApiScenario(env.VITE_API_SCENARIO),
    dbScenario: parseDbScenario(env.VITE_DB_SCENARIO),
  };
}
