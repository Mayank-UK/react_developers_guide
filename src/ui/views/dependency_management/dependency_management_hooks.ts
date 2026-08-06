import { useState } from 'react';
import { container } from '../../../core/container';
import { Environment } from '../../../core/config/app-config';
import { ApiScenario } from '../../../core/scenario/api-scenario';
import { DbScenario } from '../../../core/scenario/db-scenario';

/**
 * Dependency-management screen custom hooks — own the wiring inspector's state +
 * logic. It reads the live container (env config, active scenarios, and the
 * fake/live wiring descriptor) and exposes setters that flip the runtime
 * scenario holders then force a re-render so the graph readout updates.
 *
 * Note: `remoteIsFake` / `dbIsFake` come from the container's value-based
 * `getWiring()` rather than `instanceof` checks against data-layer classes —
 * `ui/` must not couple to `data/` internals (see ARCHITECTURE.md). Likewise
 * `useFakeApi` reads the live wiring so it stays correct after a runtime
 * fake↔live swap, instead of the immutable AppConfig value.
 */
export interface WiringDemo {
    rerender: () => void;
    environment: Environment;
    useFakeApi: boolean;
    useFakeDatabase: boolean;
    apiScenario: ApiScenario;
    dbScenario: DbScenario;
    remoteIsFake: boolean;
    dbIsFake: boolean;
    setApiScenario: (s: ApiScenario) => void;
    setDbScenario: (s: DbScenario) => void;
}

export function useWiringDemo(): WiringDemo {
    const [, setTick] = useState(0);
    const rerender = () => setTick((t) => t + 1);

    const config = container.appConfig;
    // `getWiring()` reflects runtime swaps (e.g. setUseFakeApi); re-read every
    // render so the readout stays live without `instanceof`-checking data classes.
    const wiring = container.getWiring();

    const setApiScenario = (s: ApiScenario) => {
        container.setApiScenario(s);
        rerender();
    };
    const setDbScenario = (s: DbScenario) => {
        container.setDbScenario(s);
        rerender();
    };

    return {
        rerender,
        environment: config.environment,
        useFakeApi: wiring.remote === 'fake',
        useFakeDatabase: wiring.db === 'fake',
        apiScenario: container.getApiScenario(),
        dbScenario: container.getDbScenario(),
        remoteIsFake: wiring.remote === 'fake',
        dbIsFake: wiring.db === 'fake',
        setApiScenario,
        setDbScenario,
    };
}
