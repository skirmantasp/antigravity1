/**
 * decisionEngine.js
 *
 * Pure decision function. No branching logic.
 *
 * ARCHITECTURE:
 *   - Receives pre-derived signals: { stability, baseStatus, sport }.
 *   - Looks up in DECISION_MAP[sport][stability][baseStatus].
 *   - Falls back to _default map if sport has no override.
 *   - Falls back to ENGINE_STATES.CONTROL if lookup fails.
 *
 * This function does NOT:
 *   - normalize input
 *   - derive signals
 *   - format output
 *
 * Single responsibility: map lookup → state string.
 */

import { ENGINE_STATES } from "./constants.js";
import { DECISION_MAP } from "../config/decisionMap.js";

/**
 * @param {{ stability: string, baseStatus: string, sport: string }} signals
 * @returns {string} A valid ENGINE_STATE string.
 */
export function decideState(signals) {
    const sportMap = DECISION_MAP[signals.sport] ?? DECISION_MAP._default;

    return sportMap?.[signals.stability]?.[signals.baseStatus] ?? ENGINE_STATES.CONTROL;
}


