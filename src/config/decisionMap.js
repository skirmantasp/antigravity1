/**
 * decisionMap.js
 *
 * Data-driven decision configuration.
 * Maps [sport] → [stability] → [baseStatus] → training state.
 *
 * RULES:
 *   - _default applies to all sports without a specific override.
 *   - To add a sport-specific path, add a keyed entry (e.g. "running").
 *   - Values MUST be valid ENGINE_STATE strings.
 *   - This file contains ONLY configuration — no logic, no lookups.
 *
 * Consumed by: decisionEngine.js (not yet wired — extraction only).
 */

import { TRAINING_STATES } from "../core/constants.js";

export const DECISION_MAP = Object.freeze({

    /**
     * _default — applies to all sports without a specific override.
     *
     * Truth table:
     *   stable   + base_needed → CONTROL
     *   stable   + base_ready  → PROGRESS
     *   unstable + base_needed → STABILIZE
     *   unstable + base_ready  → STABILIZE
     */
    _default: {
        stable: {
            base_needed: TRAINING_STATES.CONTROL,
            base_ready: TRAINING_STATES.PROGRESS,
        },
        unstable: {
            base_needed: TRAINING_STATES.STABILIZE,
            base_ready: TRAINING_STATES.STABILIZE,
        },
    },

    // ── Future sport overrides ──
    // running:  { stable: { ... }, unstable: { ... } },
    // swimming: { stable: { ... }, unstable: { ... } },
});
