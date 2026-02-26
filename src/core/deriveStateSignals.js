/**
 * deriveStateSignals.js
 *
 * Derives engine-readable signal keys from a normalized athlete.
 * Runs SECOND in the engine pipeline — after normalizeAthlete, before decideState.
 *
 * PURPOSE:
 *   Translates athlete fields into the exact keys that DECISION_MAP expects.
 *   This is the ONLY place where field → key mapping happens.
 *
 * OUTPUT:
 *   { stability: "stable"|"unstable", baseStatus: "base_needed"|"base_ready", sport: string }
 *
 * No decision logic. No lookups. Only signal derivation.
 */

export function deriveStateSignals(athlete) {
    return {
        stability: athlete.stable ? "stable" : "unstable",
        baseStatus: athlete.baseNeeded ? "base_needed" : "base_ready",
        sport: athlete.sport || "default",
    };
}
