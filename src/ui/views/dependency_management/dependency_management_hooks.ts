import { useState } from 'react';
import { container } from '../../../core/container';
import { Environment } from '../../../core/config/app-config';
import { ApiScenario } from '../../../core/scenario/api-scenario';
import { DbScenario } from '../../../core/scenario/db-scenario';
import { FakeApiService } from '../../../data/fake/fake-api-service';
import { FakeAppDatabase } from '../../../data/fake/fake-app-database';

/**
 * Dependency-management screen custom hooks — own the wiring inspector's state +
 * logic. It reads the live container (env config, active scenarios, and whether
 * each slot resolved to a fake or real impl via instanceof) and exposes setters
 * that flip the runtime scenario holders then force a re-render so the graph
 * readout updates.
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
        useFakeApi: config.useFakeApi,
        useFakeDatabase: config.useFakeDatabase,
        apiScenario: container.getApiScenario(),
        dbScenario: container.getDbScenario(),
        remoteIsFake: container.postRemoteDataSource instanceof FakeApiService,
        dbIsFake: container.appDatabase instanceof FakeAppDatabase,
        setApiScenario,
        setDbScenario,
    };
}
