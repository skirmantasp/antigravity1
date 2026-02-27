/**
 * buildResultViewModel.js
 *
 * View Model adapter — the single bridge between Engine and UI.
 *
 * ARCHITECTURE:
 *   Engine (data)  →  validateResultContract  →  buildResultViewModel  →  UI (render)
 *
 * This function:
 *   1. Validates input via CONTRACT GUARD (safe defaults, strips extras).
 *   2. Attaches visual config from STATE_CONFIG.
 *   3. Returns a UI-ready view model object.
 *
 * SAFETY:
 *   - Null/undefined input → safe defaults + fallback UI.
 *   - Unknown state → FALLBACK_CONFIG (gray badge, never crashes).
 *   - Missing text fields → contract defaults.
 *   - Extra fields → stripped by contract guard.
 *
 * The UI NEVER reads raw engine data.
 * The Engine NEVER knows about UI config.
 * This adapter is the only place where the two meet.
 */

import { STATE_CONFIG, FALLBACK_CONFIG } from "./stateConfig.js";
import { validateResultContract } from "../core/validateResultContract.js";

/**
 * @param {{ state: string, focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string } | null | undefined} engineResult
 * @returns {{ state: string, focus: string, sessionType: string, intensity: string, volume: string, restPeriod: string, notes: string, ui: { label: string, badgeColor: string, background: string, borderColor: string } }}
 */
export function buildResultViewModel(engineResult) {
    // CONTRACT GUARD: validate + normalize before attaching UI config
    const safe = validateResultContract(engineResult);
    const ui = STATE_CONFIG[safe.state] ?? FALLBACK_CONFIG;

    return {
        ...safe,
        ui,
    };
}


