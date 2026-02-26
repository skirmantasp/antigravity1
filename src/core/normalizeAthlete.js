/**
 * normalizeAthlete.js
 *
 * Guarantees safe defaults for raw athlete input.
 * Runs FIRST in the engine pipeline — before any decision logic.
 *
 * RULES:
 *   - stable    → boolean (default: false)
 *   - baseNeeded → boolean (default: false)
 *   - sport     → string  (default: "default")
 *   - name      → string  (default: "unknown")
 *   - Missing or null input → returns a full default athlete.
 *
 * No decision logic. No signals. Only safe normalization.
 */

export function normalizeAthlete(raw) {
    if (!raw) {
        return {
            name: "unknown",
            sport: "default",
            stable: false,
            baseNeeded: false,
        };
    }

    return {
        name: typeof raw.name === "string" ? raw.name : "unknown",
        sport: typeof raw.sport === "string" ? raw.sport : "default",
        stable: Boolean(raw.stable),
        baseNeeded: Boolean(raw.baseNeeded),
    };
}
