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
