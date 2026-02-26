/**
 * stateConfig.js
 *
 * UI-only visual mapping per training state.
 * This file owns ALL presentation decisions — colors, labels, backgrounds.
 *
 * The AI engine has NO knowledge of this file.
 * The engine returns data; the UI applies visuals from this config.
 *
 * To add a new visual state, add an entry here. No engine changes needed.
 */

export const STATE_CONFIG = Object.freeze({
    STABILIZE: {
        label: "Stabilize",
        badgeColor: "#e74c3c",
        background: "#fdf0ef",
        borderColor: "#e74c3c",
    },
    CONTROL: {
        label: "Control",
        badgeColor: "#f39c12",
        background: "#fef9ed",
        borderColor: "#f39c12",
    },
    PROGRESS: {
        label: "Progress",
        badgeColor: "#27ae60",
        background: "#eefbf3",
        borderColor: "#27ae60",
    },
});

export const FALLBACK_CONFIG = Object.freeze({
    label: "Unknown",
    badgeColor: "#7f8c8d",
    background: "#f4f4f4",
    borderColor: "#7f8c8d",
});
