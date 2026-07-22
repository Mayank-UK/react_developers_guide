import { ApiScenario } from '../../core/scenario/api-scenario';
import {
  NetworkException,
  ServerException,
} from '../../core/error-handling/exceptions';
import type { PostRemoteDataSource } from '../remote/post-remote-data-source';
import type { PostDTO } from '../remote/dtos/post-dto';

/**
 * FakeApiService — a dev-only stand-in for the real remote data source(s).
 * Mirrors the Flutter guide's `FakeApiService`. Until a backend exists (or to
 * exercise failure paths), this returns canned data after a small delay and
 * throws typed AppExceptions based on the active `ApiScenario`.
 *
 * `setScenario` lets the Exception-handling screen flip the behaviour at runtime.
 */
export class FakeApiService implements PostRemoteDataSource {
  private scenario: ApiScenario;

  private readonly posts: PostDTO[] = [
    { id: 1, title: 'Fake post', body: 'From fake API' },
    {
      id: 2,
      title: 'Clean architecture in React',
      body: 'Domain → Data → UI, with use cases and repositories.',
    },
    {
      id: 3,
      title: 'Error pipeline',
      body: 'Exceptions become Failures; severity drives the UI.',
    },
  ];

  constructor(scenario: ApiScenario = ApiScenario.Success) {
    this.scenario = scenario;
  }

  setScenario(scenario: ApiScenario): void {
    this.scenario = scenario;
  }

  getScenario(): ApiScenario {
    return this.scenario;
  }

  getPosts(): Promise<PostDTO[]> {
    return this.simulate(() => [...this.posts]);
  }

  private async simulate<T>(onSuccess: () => T): Promise<T> {
    await delay(600);
    switch (this.scenario) {
      case ApiScenario.NetworkError:
        throw new NetworkException();
      case ApiScenario.Timeout:
        throw new NetworkException('Simulated request timed out');
      case ApiScenario.ServerError:
        throw new ServerException('Simulated server returned 500');
      case ApiScenario.InvalidJson:
        throw new ServerException('Simulated invalid response format');
      case ApiScenario.Success:
      default:
        return onSuccess();
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
