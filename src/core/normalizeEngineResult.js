/**
 * normalizeEngineResult.js
 *
 * Validates and normalizes raw engine output into a strict contract shape.
 *
 * RULES:
 *   1. State MUST be a valid ENGINE_STATE. Invalid → fallback to CONTROL.
 *   2. Output shape is always flat: { state, focus, sessionType, intensity, volume, restPeriod, notes }.
 *   3. No extra fields pass through.
 *   4. Missing string fields default to empty string — never undefined.
 *
 * This function is the ONLY gateway between raw engine output and the rest of the system.
 * Nothing downstream ever sees unvalidated engine data.
 */

import { ENGINE_STATES, VALID_ENGINE_STATES } from "./constants.js";

/**
 * @param {{ state: string, actions: object }} raw - Raw output from getDecisionResult().
 * @returns {{ state: string, focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string }}
 */
export function normalizeEngineResult(raw) {
    const actions = raw?.actions ?? {};

    // Validate state — fallback to CONTROL if unknown.
    const state = VALID_ENGINE_STATES.has(raw?.state)
        ? raw.state
        : ENGINE_STATES.CONTROL;

    return {
        state,
        focus: actions.focus ?? "",
        sessionType: actions.sessionType ?? "",
        intensity: actions.intensity ?? "",
        volume: actions.volume ?? "",
        restPeriod: actions.restPeriod ?? "",
        notes: actions.notes ?? "",
    };
}
