import { type AppConfig } from './config/app-config';
import { Logger } from './config/logger';
import { ApiScenario } from './scenario/api-scenario';
import { DbScenario } from './scenario/db-scenario';
import { createHttpClient } from '../data/remote/http-client';
import {
    type PostRemoteDataSource,
    JsonPlaceholderPostRemoteDataSource,
} from '../data/remote/post-remote-data-source';
import { AppDatabase, AppDatabaseImpl } from '../data/local/app-database';
import { PostRepositoryImpl } from '../data/repositories/post-repository-impl';
import type { PostRepository } from '../domain/repositories/post-repository';
import { GetPostsUseCase } from '../domain/usecases/get-posts-usecase';
import { FakeApiService } from '../data/fake/fake-api-service';
import { FakeAppDatabase } from '../data/fake/fake-app-database';
import type { AxiosInstance } from 'axios';

/**
 * Service-locator container — mirrors the Flutter guide's `getIt` (get_it) plus
 * `injection_module.dart`.
 *
 * Note (React vs Flutter): Flutter uses `get_it` + `@injectable` codegen so
 * constructors auto-wire. React has no equivalent standard, so this is a small
 * hand-rolled locator: `register` singletons, `resolve` them. It keeps wiring
 * in one explicit, debuggable place and lets screens resolve dependencies
 * without prop-drilling or a global variable per service.
 *
 * Dev builds swap in `FakeApiService` / `FakeAppDatabase` and the
 * failure-injection interceptor, driven by a mutable scenario holder so the
 * Exception-handling screen can flip outcomes at runtime.
 */

interface ScenarioHolder {
    api: ApiScenario;
    db: DbScenario;
}

class Container {
    private config!: AppConfig;
    private readonly registry = new Map<symbol, unknown>();
    private readonly scenario: ScenarioHolder = {
        api: ApiScenario.Success,
        db: DbScenario.Success,
    };
    private fakeApi?: FakeApiService;
    private fakeDb?: FakeAppDatabase;

    initialize(config: AppConfig): void {
        this.config = config;
        this.scenario.api = config.apiScenario;
        this.scenario.db = config.dbScenario;

        // Eager singletons.
        this.register('AppConfig', config);
        this.register(
            'Logger',
            new Logger(config.environment, config.enableLogs),
        );
        this.register(
            'HttpClient',
            createHttpClient({
                config,
                logger: this.resolve('Logger'),
                getScenario: () => this.scenario.api,
            }),
        );
        this.register(
            'PostRemoteDataSource',
            this.createPostRemoteDataSource(),
        );
        this.register('AppDatabase', this.createAppDatabase());
        this.register('PostRepository', this.createPostRepository());
        this.register('GetPostsUseCase', this.createGetPostsUseCase());
    }

    // ---- service accessors ----

    get appConfig(): AppConfig {
        return this.resolve('AppConfig');
    }
    get logger(): Logger {
        return this.resolve('Logger');
    }
    get httpClient(): AxiosInstance {
        return this.resolve('HttpClient');
    }
    get postRemoteDataSource(): PostRemoteDataSource {
        return this.resolve('PostRemoteDataSource');
    }
    get appDatabase(): AppDatabase {
        return this.resolve('AppDatabase');
    }
    get postRepository(): PostRepository {
        return this.resolve('PostRepository');
    }
    get getPostsUseCase(): GetPostsUseCase {
        return this.resolve('GetPostsUseCase');
    }

    // ---- runtime scenario control (dev) ----

    setApiScenario(scenario: ApiScenario): void {
        this.scenario.api = scenario;
        this.fakeApi?.setScenario(scenario);
    }
    setDbScenario(scenario: DbScenario): void {
        this.scenario.db = scenario;
        this.fakeDb?.setScenario(scenario);
    }
    getApiScenario(): ApiScenario {
        return this.scenario.api;
    }
    getDbScenario(): DbScenario {
        return this.scenario.db;
    }

    /** Test-only: tear down registered singletons (e.g. close Dexie). */
    async dispose(): Promise<void> {
        const db = this.registry.get(key('AppDatabase'));
        if (db instanceof AppDatabaseImpl) {
            await db.close();
        }
        this.registry.clear();
    }

    // ---- wiring helpers ----

    private createPostRemoteDataSource(): PostRemoteDataSource {
        if (this.config.useFakeApi) {
            this.fakeApi = new FakeApiService(this.scenario.api);
            return this.fakeApi;
        }
        return new JsonPlaceholderPostRemoteDataSource(this.httpClient);
    }

    private createAppDatabase(): AppDatabase {
        if (this.config.useFakeDatabase) {
            this.fakeDb = new FakeAppDatabase(this.scenario.db);
            return this.fakeDb;
        }
        return new AppDatabaseImpl();
    }

    private createPostRepository(): PostRepository {
        return new PostRepositoryImpl(
            this.postRemoteDataSource,
            this.appDatabase,
            this.logger,
        );
    }

    private createGetPostsUseCase(): GetPostsUseCase {
        return new GetPostsUseCase(this.postRepository);
    }

    private register<T>(name: string, instance: T): void {
        this.registry.set(key(name), instance);
    }

    private resolve<T>(name: string): T {
        const instance = this.registry.get(key(name));
        if (instance === undefined) {
            throw new Error(`Dependency "${name}" is not registered`);
        }
        return instance as T;
    }
}

const KEY_REGISTRY = new Map<string, symbol>();
function key(name: string): symbol {
    let sym = KEY_REGISTRY.get(name);
    if (!sym) {
        sym = Symbol(name);
        KEY_REGISTRY.set(name, sym);
    }
    return sym;
}

export const container = new Container();
