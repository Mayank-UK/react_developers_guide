import { describe, expect, it } from 'vitest';
import { createAppConfig } from './index';
import { Environment } from './app-config';
import { ApiScenario } from '../scenario/api-scenario';
import { DbScenario } from '../scenario/db-scenario';

/** Build a minimal ImportMetaEnv for testing createAppConfig. */
function env(overrides: Record<string, string | undefined> = {}): ImportMetaEnv {
    return { MODE: 'development', ...overrides } as unknown as ImportMetaEnv;
}

describe('createAppConfig', () => {
    it('parses booleans with the documented fallback', () => {
        expect(createAppConfig(env({ VITE_USE_FAKE_API: 'false' })).useFakeApi).toBe(false);
        expect(createAppConfig(env({ VITE_USE_FAKE_API: 'true' })).useFakeApi).toBe(true);
        // dev defaults to fakes on when the var is absent
        expect(createAppConfig(env({})).useFakeApi).toBe(true);
    });

    it('forces fakes off outside dev', () => {
        const prod = createAppConfig(
            env({ MODE: 'production', VITE_USE_FAKE_API: 'true', VITE_USE_FAKE_DB: 'true' }),
        );
        expect(prod.environment).toBe(Environment.Prod);
        expect(prod.useFakeApi).toBe(false);
        expect(prod.useFakeDatabase).toBe(false);
    });

    it('parses validated scenarios', () => {
        expect(
            createAppConfig(env({ VITE_API_SCENARIO: 'networkError' })).apiScenario,
        ).toBe(ApiScenario.NetworkError);
        expect(
            createAppConfig(env({ VITE_DB_SCENARIO: 'readError' })).dbScenario,
        ).toBe(DbScenario.ReadError);
    });

    it('defaults scenarios to success when unset', () => {
        expect(createAppConfig(env({})).apiScenario).toBe(ApiScenario.Success);
        expect(createAppConfig(env({})).dbScenario).toBe(DbScenario.Success);
    });

    it('resolves staging/production/development/test modes', () => {
        expect(createAppConfig(env({ MODE: 'staging' })).environment).toBe(Environment.Staging);
        expect(createAppConfig(env({ MODE: 'production' })).environment).toBe(Environment.Prod);
        expect(createAppConfig(env({ MODE: 'test' })).environment).toBe(Environment.Dev);
    });

    it('throws on an unknown mode (fail-fast on misconfiguration)', () => {
        expect(() => createAppConfig(env({ MODE: 'banana' }))).toThrow(/Unknown Vite mode/);
    });

    it('throws on an invalid scenario value', () => {
        expect(() =>
            createAppConfig(env({ VITE_API_SCENARIO: 'not-a-scenario' })),
        ).toThrow(/Invalid VITE_API_SCENARIO/);
        expect(() =>
            createAppConfig(env({ VITE_DB_SCENARIO: 'nope' })),
        ).toThrow(/Invalid VITE_DB_SCENARIO/);
    });

    it('disables logs in prod and enables them elsewhere by default', () => {
        expect(createAppConfig(env({ MODE: 'production' })).enableLogs).toBe(false);
        expect(createAppConfig(env({ MODE: 'development' })).enableLogs).toBe(true);
    });
});
