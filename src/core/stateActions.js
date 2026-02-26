/**
 * stateActions.js
 *
 * Maps a training state string to a structured action recommendation.
 * Pure function — no side effects, no mutations.
 *
 * Designed to be extended with additional context
 * (injury, fatigue, biobit score) in future iterations.
 */

import { TRAINING_STATES, SESSION_TYPES, REST_PERIODS } from "./constants.js";

const ACTION_MAP = {
    [TRAINING_STATES.STABILIZE]: {
        focus: "joint stability & motor control",
        sessionType: SESSION_TYPES.CORRECTIVE,
        intensity: "low",
        volume: "moderate",
        restPeriod: REST_PERIODS.SHORT,
        notes: "Prioritize controlled movement patterns. Avoid load progression until stability is confirmed.",
    },

    [TRAINING_STATES.CONTROL]: {
        focus: "movement quality & base building",
        sessionType: SESSION_TYPES.FOUNDATIONAL,
        intensity: "low-moderate",
        volume: "moderate",
        restPeriod: REST_PERIODS.SHORT,
        notes: "Reinforce base patterns before adding complexity. Monitor form under fatigue.",
    },

    [TRAINING_STATES.PROGRESS]: {
        focus: "progressive overload & performance",
        sessionType: SESSION_TYPES.DEVELOPMENT,
        intensity: "moderate-high",
        volume: "high",
        restPeriod: REST_PERIODS.MEDIUM,
        notes: "Athlete is stable and ready for load increases. Track volume progression across sessions.",
    },

    RECOVER: {
        focus: "active recovery & tissue repair",
        sessionType: "recovery",
        intensity: "very low",
        volume: "low",
        restPeriod: "as needed",
        notes: "Light movement only. Focus on blood flow, mobility, and nervous system downregulation.",
    },

    RESET: {
        focus: "deload & system reset",
        sessionType: "deload",
        intensity: "minimal",
        volume: "minimal",
        restPeriod: "extended",
        notes: "Full deload phase. Reduce all training variables. Re-assess readiness before resuming.",
    },
};

const UNKNOWN_ACTION = {
    focus: "assessment required",
    sessionType: "evaluation",
    intensity: "none",
    volume: "none",
    restPeriod: "n/a",
    notes: "Unable to determine training state. Run athlete assessment before prescribing actions.",
};

/**
 * Returns a structured action recommendation for the given training state.
 *
 * @param {string} state - The training state (e.g. "STABILIZE", "PROGRESS").
 * @returns {{ focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string }}
 */
export function getActions(state) {
    const action = ACTION_MAP[state] ?? UNKNOWN_ACTION;

    // Return a shallow copy to prevent external mutation
    return { ...action, state: state ?? "UNKNOWN" };
}
