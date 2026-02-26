/**
 * constants.js
 *
 * Shared, frozen constants for the training intelligence layer.
 * All values are immutable — no mutations allowed at runtime.
 *
 * Named exports only. No default export.
 */

export const TRAINING_STATES = Object.freeze({
    STABILIZE: "STABILIZE",
    CONTROL: "CONTROL",
    PROGRESS: "PROGRESS",
});

export const SESSION_TYPES = Object.freeze({
    CORRECTIVE: "corrective",
    FOUNDATIONAL: "foundational",
    DEVELOPMENT: "development",
});

export const REST_PERIODS = Object.freeze({
    SHORT: "60-90s",
    MEDIUM: "90-120s",
    LONG: "120-180s",
});

/**
 * ENGINE_STATES — strict output contract enum.
 *
 * TRAINING_STATES is used internally by the engine.
 * ENGINE_STATES defines what the engine is allowed to return.
 * Both reference the same values (single source of truth).
 */
export const ENGINE_STATES = Object.freeze({
    CONTROL: TRAINING_STATES.CONTROL,
    STABILIZE: TRAINING_STATES.STABILIZE,
    PROGRESS: TRAINING_STATES.PROGRESS,
});

/** Set of valid engine output states — used for O(1) validation. */
export const VALID_ENGINE_STATES = Object.freeze(
    new Set(Object.values(ENGINE_STATES))
);

