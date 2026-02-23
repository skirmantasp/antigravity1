import type { SportContext } from "../types";

type Tone = "PROGRESS" | "CONTROLLED" | "REDUCE";

// ── AC Ratio thresholds (spec exact) ────────────────────────────────────────

/**
 * Applies the AC ratio modifier layer on top of the already-resolved
 * presentationTone. Runs AFTER all readiness and neural downgrade rules.
 * Only constrains — never upgrades. Only active for STRENGTH context athletes.
 *
 * Thresholds:
 *   > 1.6              → force REDUCE
 *   1.3 – 1.6         → cap at CONTROLLED (PROGRESS → CONTROLLED; others unchanged)
 *   0.8 – 1.3         → no modification (optimal zone)
 *   < 0.8             → PROGRESS allowed only if readinessScore > 60,
 *                        otherwise cap at CONTROLLED
 *   null / undefined  → no modification
 */
export function applyACRatioModifier(
    tone: Tone,
    acRatio: number | undefined,
    readinessScore: number,
    sportContext: SportContext | undefined,
): Tone {
    // Gate: only Strength block athletes with a computed AC ratio
    if (sportContext !== "STRENGTH" || acRatio === undefined || acRatio === null) {
        return tone;
    }

    // > 1.6: force REDUCE (overtraining signal — override everything)
    if (acRatio > 1.6) return "REDUCE";

    // 1.3 ≤ acRatio ≤ 1.6: cap at CONTROLLED
    if (acRatio >= 1.3) {
        return tone === "PROGRESS" ? "CONTROLLED" : tone;
    }

    // 0.8 ≤ acRatio < 1.3: no modification (optimal training zone)
    if (acRatio >= 0.8) return tone;

    // acRatio < 0.8 (undertraining / deload zone):
    // PROGRESS is permitted only if readiness supports it (> 60).
    // If readiness is low, cap at CONTROLLED as a safety floor.
    if (tone === "PROGRESS") {
        return readinessScore > 60 ? "PROGRESS" : "CONTROLLED";
    }

    return tone; // CONTROLLED and REDUCE pass through unchanged
}
