import { useState } from 'react';
import { Logger } from '../../../core/config/logger';

/**
 * Debugging screen custom hooks — own the state + logic for the two live demos:
 *   - useLoggerDemo: the logger playground (prod-gate toggle + captured lines).
 *   - useCrashDemo: the error-boundary trigger (a single on-demand crash flag).
 * The DemoBoundary class component and Crashable stay in the view — the class's
 * own getDerivedStateFromError state is the thing being demonstrated.
 */

export const LEVELS = ['debug', 'info', 'warning', 'error'] as const;
export type Level = (typeof LEVELS)[number];

export interface LoggerDemo {
    prodMode: boolean;
    setProdMode: (on: boolean) => void;
    log: string[];
    emit: (level: Level) => void;
}

export function useLoggerDemo(): LoggerDemo {
    const [prodMode, setProdMode] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const emit = (level: Level) => {
        const logger = new Logger('Playground', !prodMode);
        const before = console.log;
        const captured: string[] = [];
        // Demo-only: temporarily monkeypatch console.log to capture what the
        // Logger actually emits. Mutating a host global is intentionally
        // pedagogical — restored in the `finally` below.
        console.log = (...args: unknown[]) => {
            captured.push(args.map(String).join(' '));
        };
        try {
            logger[level](`emitted at ${level} level`);
        } finally {
            console.log = before;
        }
        // If the gate dropped it (captured empty), say so explicitly.
        const line =
            captured.length > 0
                ? (captured[0] ?? '')
                : `(dropped — below ${prodMode ? 'error' : 'debug'} gate)`;
        setLog((l) => [line, ...l].slice(0, 8));
    };

    return { prodMode, setProdMode, log, emit };
}

export interface CrashDemo {
    crash: boolean;
    toggle: () => void;
}

export function useCrashDemo(): CrashDemo {
    const [crash, setCrash] = useState(false);
    return { crash, toggle: () => setCrash((c) => !c) };
}
