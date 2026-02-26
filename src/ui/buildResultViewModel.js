/**
 * buildResultViewModel.js
 *
 * View Model adapter — the single bridge between Engine and UI.
 *
 * ARCHITECTURE:
 *   Engine (data)  →  buildResultViewModel  →  UI (render)
 *
 * This function:
 *   1. Receives flat engine output (no UI fields).
 *   2. Attaches visual config from STATE_CONFIG.
 *   3. Returns a UI-ready view model object.
 *
 * SAFETY:
 *   - Null/undefined input → safe defaults + fallback UI.
 *   - Unknown state → FALLBACK_CONFIG (gray badge, never crashes).
 *   - Missing text fields → empty string.
 *
 * The UI NEVER reads raw engine data.
 * The Engine NEVER knows about UI config.
 * This adapter is the only place where the two meet.
 */

import { STATE_CONFIG, FALLBACK_CONFIG } from "./stateConfig.js";

/**
 * @param {{ state: string, focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string } | null | undefined} engineResult
 * @returns {{ state: string, focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string, ui: { label: string, badgeColor: string, background: string, borderColor: string } }}
 */
export function buildResultViewModel(engineResult) {
    const result = engineResult ?? {};
    const ui = STATE_CONFIG[result.state] ?? FALLBACK_CONFIG;

    return {
        state: result.state ?? "",
        focus: result.focus ?? "",
        sessionType: result.sessionType ?? "",
        intensity: result.intensity ?? "",
        volume: result.volume ?? "",
        restPeriod: result.restPeriod ?? "",
        notes: result.notes ?? "",
        ui,
    };
}

