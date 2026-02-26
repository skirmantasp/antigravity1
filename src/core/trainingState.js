/**
 * trainingState.js
 *
 * Engine pipeline orchestrator.
 *
 * FLOW (top-to-bottom):
 *   1. normalizeAthlete()     — safe defaults for raw input
 *   2. deriveStateSignals()   — athlete fields → engine signal keys
 *   3. decideState()          — signals → state via DECISION_MAP
 *   4. getActions()           — state → base action recommendations
 *   5. applySportProfile()    — merge sport-specific overrides
 *   6. normalizeEngineResult() — validate + flatten to contract shape
 *
 * Each function has ONE responsibility.
 * No nested conditions. No UI imports. Fully data-driven.
 */

import { normalizeAthlete } from "./normalizeAthlete.js";
import { deriveStateSignals } from "./deriveStateSignals.js";
import { decideState } from "./decisionEngine.js";
import { getActions } from "./stateActions.js";
import { normalizeEngineResult } from "./normalizeEngineResult.js";
import { SPORT_PROFILES } from "../config/sportProfiles.js";

/**
 * Allowlist of fields that sport profiles may override.
 * These are the engine contract fields ONLY — no UI fields permitted.
 *
 * Any field not in this set is silently stripped from sport profile overrides.
 */
const ALLOWED_PROFILE_FIELDS = new Set([
    "focus",
    "sessionType",
    "intensity",
    "volume",
    "restPeriod",
    "notes",
]);

/**
 * Merges sport-specific overrides on top of base actions.
 * ONLY allowlisted engine contract fields pass through.
 * Missing sport → default profile. Missing state → no overrides.
 *
 * @param {string} sport
 * @param {string} state
 * @param {object} baseActions
 * @returns {object}
 */
function applySportProfile(sport, state, baseActions) {
    const profile = SPORT_PROFILES[sport] ?? SPORT_PROFILES.default;
    const rawOverrides = profile[state] ?? {};

    // Filter: only allowed domain fields pass through.
    const safeOverrides = {};
    for (const key of Object.keys(rawOverrides)) {
        if (ALLOWED_PROFILE_FIELDS.has(key)) {
            safeOverrides[key] = rawOverrides[key];
        }
    }

    return { ...baseActions, ...safeOverrides };
}

/**
 * Convenience function — returns just the state string.
 *
 * @param {object} rawAthlete
 * @returns {string}
 */
export function getTrainingState(rawAthlete) {
    const athlete = normalizeAthlete(rawAthlete);
    const signals = deriveStateSignals(athlete);

    return decideState(signals);
}

/**
 * Full engine pipeline — returns a normalized, production-safe result.
 *
 * normalizeAthlete → deriveStateSignals → decideState → getActions → applySportProfile → normalizeEngineResult
 *
 * @param {object} rawAthlete
 * @returns {{ state: string, focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string }}
 */
export function getDecisionResult(rawAthlete) {
    const athlete = normalizeAthlete(rawAthlete);
    const signals = deriveStateSignals(athlete);
    const state = decideState(signals);
    const baseActions = getActions(state);
    const actions = applySportProfile(athlete.sport, state, baseActions);

    return normalizeEngineResult({ state, actions });
}



