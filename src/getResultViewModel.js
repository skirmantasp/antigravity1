/**
 * getResultViewModel.js
 *
 * ┌──────────────────────────────────────────────────────┐
 * │  SINGLE PUBLIC ENTRY POINT FOR RESULT RENDERING      │
 * │                                                      │
 * │  UI imports THIS function and NOTHING ELSE.          │
 * │  No engine internals. No raw results. No config.     │
 * └──────────────────────────────────────────────────────┘
 *
 * FULL PIPELINE:
 *   rawAthleteInput
 *     → normalizeAthlete()      (safe defaults)
 *     → deriveStateSignals()    (engine keys)
 *     → decideState()           (DECISION_MAP lookup)
 *     → getActions()            (base action map)
 *     → applySportProfile()     (allowlisted domain overrides)
 *     → normalizeEngineResult() (strict 7-field contract)
 *     → validateEngineContract() (final shape guard)
 *     → buildResultViewModel()  (attach UI config)
 *     ⇒ returns ResultViewModel
 *
 * SAFETY:
 *   - If ANY step throws, returns a safe CONTROL ViewModel.
 *   - UI can NEVER crash from this function.
 */

import { getDecisionResult } from "./core/trainingState.js";
import { buildResultViewModel } from "./ui/buildResultViewModel.js";
import { ENGINE_STATES, VALID_ENGINE_STATES } from "./core/constants.js";

/* ── Engine contract field list (single source of truth) ── */

const ENGINE_CONTRACT_FIELDS = [
    "state", "focus", "sessionType", "intensity", "volume", "restPeriod", "notes",
];

/* ── Contract validator ────────────────────────────────── */

/**
 * Final shape guard — ensures the engine result has EXACTLY the 7 contract fields,
 * all are strings, and state is valid. Strips any extras that somehow leaked through.
 *
 * @param {object} result
 * @returns {{ state: string, focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string }}
 */
function validateEngineContract(result) {
    const validated = {};

    for (const field of ENGINE_CONTRACT_FIELDS) {
        if (field === "state") {
            validated.state = VALID_ENGINE_STATES.has(result?.state)
                ? result.state
                : ENGINE_STATES.CONTROL;
        } else {
            validated[field] = typeof result?.[field] === "string" ? result[field] : "";
        }
    }

    return validated;
}

/* ── Safe fallback ViewModel ───────────────────────────── */

/**
 * Returns a guaranteed-safe CONTROL ViewModel.
 * Used when any pipeline step throws an exception.
 */
function buildSafeFallbackViewModel() {
    const safeEngineResult = {
        state: ENGINE_STATES.CONTROL,
        focus: "",
        sessionType: "",
        intensity: "",
        volume: "",
        restPeriod: "",
        notes: "",
    };

    return buildResultViewModel(safeEngineResult);
}

/* ── Public API ────────────────────────────────────────── */

/**
 * The ONLY function the UI should call to get a renderable result.
 *
 * @param {object} rawAthleteInput — raw form data / athlete object
 * @returns {{ state: string, focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string, ui: { label: string, badgeColor: string, background: string, borderColor: string } }}
 */
export function getResultViewModel(rawAthleteInput) {
    try {
        // Steps 1-6: normalizeAthlete → deriveSignals → decideState → getActions → applySportProfile → normalizeEngineResult
        const engineResult = getDecisionResult(rawAthleteInput);

        // Step 7: Final contract validation (defense-in-depth)
        const validated = validateEngineContract(engineResult);

        // Step 8: Attach UI config → return ViewModel
        return buildResultViewModel(validated);
    } catch (_error) {
        // Pipeline failure → safe CONTROL ViewModel. UI never crashes.
        return buildSafeFallbackViewModel();
    }
}
