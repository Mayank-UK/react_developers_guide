import type {
  AxiosInterceptorManager,
  InternalAxiosRequestConfig,
} from 'axios';
import { ApiScenario } from '../../../core/scenario/api-scenario';
import {
  NetworkException,
  ServerException,
  TimeoutException,
} from '../../../core/error-handling/exceptions';

/**
 * FailureInjectionInterceptor — dev-only. Mirrors the Flutter guide's
 * `FailureInjectionInterceptor`. Lets you force the data layer down a specific
 * failure path (network / timeout / server / invalid-json) so the entire error
 * pipeline can be exercised without a real failing server.
 *
 * It inspects the active `ApiScenario` (mutable, so the Exception-handling
 * screen can flip it at runtime) and rejects with a typed AppException.
 */
export class FailureInjectionInterceptor {
  private readonly getScenario: () => ApiScenario;

  constructor(getScenario: () => ApiScenario) {
    this.getScenario = getScenario;
  }

  attach(
    request: AxiosInterceptorManager<InternalAxiosRequestConfig>,
  ): void {
    const onFulfilled = (
      config: InternalAxiosRequestConfig,
    ): InternalAxiosRequestConfig => {
      switch (this.getScenario()) {
        case ApiScenario.NetworkError:
          throw new NetworkException('Simulated no internet connection');
        case ApiScenario.Timeout:
          throw new TimeoutException('Simulated request timed out');
        case ApiScenario.ServerError:
          throw new ServerException('Simulated server returned 500');
        case ApiScenario.InvalidJson:
          throw new ServerException('Simulated invalid response format');
        case ApiScenario.Success:
        default:
          return config;
      }
    };

    // Lives for the lifetime of the app's single axios instance; no eject.
    request.use(onFulfilled);
  }
}
