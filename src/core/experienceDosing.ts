import type { ExperienceLevel } from "../types";

// ── Types ────────────────────────────────────────────────────────────────────

export type ComplexityLevel = "SIMPLE" | "STANDARD" | "ADVANCED";

export interface ExperienceDosingResult {
    /** Multiplier applied to set count inside createBlock. 1.0 = no change. */
    loadAdjustment: number;
    /** Upper ceiling applied to volumeModifier before block creation. */
    volumeCap: number;
    /** Drives exercise selection depth from the library. */
    complexityLevel: ComplexityLevel;
    /** Tempo string passed to main-block generation. */
    tempoControl: string;
}

// ── Dosing Table ─────────────────────────────────────────────────────────────
// Keyed by ExperienceLevel. Each column represents one dosing parameter.
// decisionType is used to gate load increases: PROGRESS allows full load
// adjustment; CONTROLLED and REDUCE apply a conservative ceiling regardless
// of experience level.

type DosingRow = Record<"PROGRESS" | "CONTROLLED" | "REDUCE", ExperienceDosingResult>;

const DOSING_TABLE: Record<ExperienceLevel, DosingRow> = {
    BEGINNER: {
        PROGRESS: {
            loadAdjustment: 0.85,
            volumeCap: 0.80,
            complexityLevel: "SIMPLE",
            tempoControl: "3-0-3-0",   // slow and controlled
        },
        CONTROLLED: {
            loadAdjustment: 0.80,
            volumeCap: 0.75,
            complexityLevel: "SIMPLE",
            tempoControl: "3-0-3-0",
        },
        REDUCE: {
            loadAdjustment: 0.70,
            volumeCap: 0.65,
            complexityLevel: "SIMPLE",
            tempoControl: "2-0-2-0",
        },
    },
    INTERMEDIATE: {
        PROGRESS: {
            loadAdjustment: 1.00,
            volumeCap: 1.00,
            complexityLevel: "STANDARD",
            tempoControl: "3-1-1-0",   // existing default
        },
        CONTROLLED: {
            loadAdjustment: 0.90,
            volumeCap: 0.90,
            complexityLevel: "STANDARD",
            tempoControl: "3-1-1-0",
        },
        REDUCE: {
            loadAdjustment: 0.80,
            volumeCap: 0.80,
            complexityLevel: "STANDARD",
            tempoControl: "2-0-2-0",
        },
    },
    ADVANCED: {
        PROGRESS: {
            loadAdjustment: 1.10,
            volumeCap: 1.00,
            complexityLevel: "ADVANCED",
            tempoControl: "4-1-1-0",   // more time under tension
        },
        CONTROLLED: {
            loadAdjustment: 1.00,
            volumeCap: 1.00,
            complexityLevel: "ADVANCED",
            tempoControl: "3-1-1-0",
        },
        REDUCE: {
            loadAdjustment: 0.85,
            volumeCap: 0.85,
            complexityLevel: "ADVANCED",
            tempoControl: "3-1-1-0",
        },
    },
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns four dosing parameters that shape block generation.
 * Engine scores are NOT read or modified here.
 * Undefined experienceLevel defaults to INTERMEDIATE (no-change baseline).
 */
export function applyExperienceDosing(
    decisionType: "PROGRESS" | "CONTROLLED" | "REDUCE",
    experienceLevel: ExperienceLevel | undefined
): ExperienceDosingResult {
    const level = experienceLevel ?? "INTERMEDIATE";
    return DOSING_TABLE[level][decisionType];
}
