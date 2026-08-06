import axios, {
  AxiosError,
  type AxiosInstance,
} from 'axios';
import type { AppConfig } from '../../core/config/app-config';
import { Logger } from '../../core/config/logger';
import type { ApiScenario } from '../../core/scenario/api-scenario';
import { AuthTokenInterceptor } from './interceptors/auth-token-interceptor';
import { RetryInterceptor } from './interceptors/retry-interceptor';
import { FailureInjectionInterceptor } from './interceptors/failure-injection-interceptor';

/**
 * http-client factory — builds the configured axios instance. Mirrors the
 * Flutter guide's `dio(...)` provider in `injection_module.dart`.
 *
 * Interceptor order mirrors the Flutter app:
 *   1. auth-token  (attach headers to every request)
 *   2. retry       (retry transient failures)
 *   3. failure-injection (dev only — simulates failures)
 *   4. logging     (request/response, when enabled)
 *
 * `getScenario` is captured by reference so the dev scenario can change at
 * runtime and the interceptor picks up the new value on the next request.
 */
export interface HttpClientDeps {
  config: AppConfig;
  logger: Logger;
  getToken?: () => string | null;
  getScenario: () => ApiScenario;
}

export function createHttpClient(deps: HttpClientDeps): AxiosInstance {
  const { config, logger, getToken = () => null, getScenario } = deps;

  const instance = axios.create({
    baseURL: config.baseUrl,
    timeout: 10_000,
  });

  new AuthTokenInterceptor(getToken).attach(instance);
  new RetryInterceptor().attach(instance);

  if (config.environment === 'dev') {
    new FailureInjectionInterceptor(getScenario).attach(
      instance.interceptors.request,
    );
  }

  if (config.enableLogs) {
    instance.interceptors.request.use((req) => {
      logger.debug(`→ ${req.method?.toUpperCase()} ${req.url}`);
      return req;
    });
    instance.interceptors.response.use(
      (res) => {
        logger.debug(`← ${res.status} ${res.config.url}`);
        return res;
      },
      (err: AxiosError) => {
        logger.warning(
          `✗ ${err.config?.url ?? 'request'} failed`,
          `code=${err.code ?? 'n/a'} status=${err.response?.status ?? 'n/a'} ${err.message}`,
        );
        return Promise.reject(err);
      },
    );
  }

  return instance;
}
