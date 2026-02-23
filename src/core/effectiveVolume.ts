import type { Block } from "../types";

// ── Block type multipliers (spec exact values) ────────────────────────────────

export type EffectiveVolumeBlockType =
    | "NEURAL_RESET"
    | "CONTROL_UNDER_LOAD"
    | "CAPACITY_BUILD"
    | "PERFORMANCE";

const BLOCK_MULTIPLIER: Record<EffectiveVolumeBlockType, number> = {
    NEURAL_RESET: 0.8,
    CONTROL_UNDER_LOAD: 1.0,
    CAPACITY_BUILD: 1.15,
    PERFORMANCE: 1.3,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// Parse reps to a representative midpoint number. "6–8" → 7, "5" → 5, "4–5 @RPE 8" → 4.5
function parseReps(reps: string): number {
    const stripped = reps.split("@")[0].trim();
    const match = stripped.match(/(\d+(?:\.\d+)?)[–\-](\d+(?:\.\d+)?)/);
    if (match) return (parseFloat(match[1]) + parseFloat(match[2])) / 2;
    return parseFloat(stripped) || 0;
}

// Parse eccentric duration from tempo "3-1-1-0" → 3
function parseEccentric(tempo: string): number {
    return parseFloat(tempo.split("-")[0]) || 0;
}

// Unilateral detection by exercise name keywords
const UNILATERAL_KEYWORDS = [
    "single", "unilateral", "single-leg", "single leg", "copenhagen",
    "nordic", "lunge", "bulgarian", "step-up", "rear-foot",
];
function isUnilateral(name: string): boolean {
    const lower = name.toLowerCase();
    return UNILATERAL_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Effective volume per session ──────────────────────────────────────────────

export function calculateEffectiveVolume(
    blocks: Block[],
    blockType: EffectiveVolumeBlockType,
): number {
    const base = BLOCK_MULTIPLIER[blockType];
    let total = 0;

    for (const block of blocks) {
        const reps = parseReps(block.reps);
        if (reps === 0) continue;

        let multiplier = base;

        // Tempo modifier: eccentric ≥ 3s → +0.1
        if (block.tempo) {
            if (parseEccentric(block.tempo) >= 3) multiplier += 0.1;
        }

        // Stability/unilateral modifier → +0.1
        if (isUnilateral(block.name)) multiplier += 0.1;

        total += block.sets * reps * multiplier;
    }

    return Math.round(total * 10) / 10;
}

// ── Acute / Chronic / AC Ratio ────────────────────────────────────────────────
// Uses the `volume` field on AthleteHistory (which now stores effectiveVolume).

export function calculateAcuteLoad(history: { volume: number }[]): number {
    return history.slice(-7).reduce((sum, h) => sum + h.volume, 0);
}

export function calculateChronicLoad(history: { volume: number }[]): number {
    const rolling = history.slice(-28);
    if (rolling.length === 0) return 0;
    return Math.round((rolling.reduce((sum, h) => sum + h.volume, 0) / rolling.length) * 10) / 10;
}

export function calculateACRatio(acute: number, chronic: number): number | null {
    if (chronic <= 0) return null;
    return Math.round((acute / chronic) * 100) / 100;
}
