/**
 * validateResultContract.js
 *
 * CONTRACT GUARD between engine/viewModel and UI.
 * Pure function. NEVER throws. Always returns a safe, valid object.
 *
 * REQUIRED SHAPE:
 *   { state, sessionType, focus, intensity, volume, restPeriod, notes }
 *
 * RULES:
 *   1. Missing field → insert safe default.
 *   2. Unknown extra fields → ignored (stripped).
 *   3. Null/undefined input → return full defaults.
 *   4. State must be CONTROL | STABILIZE | PROGRESS → else default to CONTROL.
 *   5. All text fields must be strings → else default to "".
 *
 * This is the LAST safety boundary before data reaches the UI.
 */

import { ENGINE_STATES, VALID_ENGINE_STATES } from "./constants.js";

/* ── Safe defaults ─────────────────────────────────────── */

const CONTRACT_DEFAULTS = Object.freeze({
    state: ENGINE_STATES.CONTROL,
    sessionType: "foundation",
    focus: "",
    intensity: "",
    volume: "",
    restPeriod: "",
    notes: "",
});

/* ── Contract field list (single source of truth) ──────── */

const CONTRACT_FIELDS = Object.keys(CONTRACT_DEFAULTS);

/* ── Public API ────────────────────────────────────────── */

/**
 * Validates and normalizes a result object to the strict UI contract shape.
 * Pure function — never throws, never mutates input.
 *
 * @param {object | null | undefined} result — raw or partially valid result
 * @returns {{ state: string, sessionType: string, focus: string, intensity: string, volume: string, restPeriod: string, notes: string }}
 */
export function validateResultContract(result) {
    if (!result || typeof result !== "object") {
        return { ...CONTRACT_DEFAULTS };
    }

    const validated = {};

    for (const field of CONTRACT_FIELDS) {
        if (field === "state") {
            // State must be a valid ENGINE_STATE
            validated.state = VALID_ENGINE_STATES.has(result.state)
                ? result.state
                : CONTRACT_DEFAULTS.state;
        } else {
            // All other fields must be strings
            validated[field] = typeof result[field] === "string"
                ? result[field]
                : CONTRACT_DEFAULTS[field];
        }
    }

    return validated;
}
