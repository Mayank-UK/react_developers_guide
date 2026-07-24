import { describe, expect, it, beforeAll } from 'vitest';
import { container } from './container';
import { createAppConfig } from './config';
import { GetPostsUseCase } from '../domain/usecases/get-posts-usecase';
import { ApiScenario } from './scenario/api-scenario';
import { DbScenario } from './scenario/db-scenario';

/**
 * The default (dev) config wires fakes for both API and DB, so initializing the
 * container here is side-effect-free (no Dexie, no real network).
 */
beforeAll(() => {
    container.initialize(createAppConfig());
});

describe('container', () => {
    it('resolves the registered singletons after initialize', () => {
        expect(container.appConfig).toBeDefined();
        expect(container.logger).toBeDefined();
        expect(container.httpClient).toBeDefined();
        expect(container.postRepository).toBeDefined();
        expect(container.getPostsUseCase).toBeInstanceOf(GetPostsUseCase);
    });

    it('round-trips the runtime api/db scenario', () => {
        container.setApiScenario(ApiScenario.ServerError);
        expect(container.getApiScenario()).toBe(ApiScenario.ServerError);

        container.setDbScenario(DbScenario.ReadError);
        expect(container.getDbScenario()).toBe(DbScenario.ReadError);

        // reset for other suites
        container.setApiScenario(ApiScenario.Success);
        container.setDbScenario(DbScenario.Success);
    });

    it('rebuilds the remote→repository→usecase graph when toggling fake api', () => {
        const before = container.getPostsUseCase;
        expect(container.getUseFakeApi()).toBe(true);

        container.setUseFakeApi(false); // switch to the live jsonplaceholder path
        expect(container.getUseFakeApi()).toBe(false);
        expect(container.getPostsUseCase).not.toBe(before); // rebuilt singleton

        // idempotent: a no-op toggle does not rebuild
        const live = container.getPostsUseCase;
        container.setUseFakeApi(false);
        expect(container.getPostsUseCase).toBe(live);

        // restore for other suites
        container.setUseFakeApi(true);
        expect(container.getUseFakeApi()).toBe(true);
    });

    it('dispose clears the registry so subsequent resolve throws', () => {
        container.dispose();
        expect(() => container.logger).toThrow(/is not registered/);
        // re-initialize so downstream suites / teardown stay valid
        container.initialize(createAppConfig());
    });
});
