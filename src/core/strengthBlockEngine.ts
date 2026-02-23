import type { NeuralState, ExperienceLevel } from "../types";
import type {
    StrengthBlock, BlockPhase, Pattern,
    PhasePrescription, PhaseTransitionSuggestion,
} from "../types/strengthBlock";
import type { EffectiveVolumeBlockType } from "./effectiveVolume";

// ── Block type ────────────────────────────────────────────────────────────────

export type BlockType = EffectiveVolumeBlockType;

// ── Experience scaling (applied before session build) ─────────────────────────

export interface ExperienceScaling {
    intensityCap: number;     // 0.75 | 0.85 | 0.95
    volumeMultiplier: number; // 0.8 | 1.0 | 1.15
    maxComplexity: 1 | 2 | 3;
    intensityLabel: string;   // human-readable for notes
}

const EXPERIENCE_SCALING: Record<ExperienceLevel | "NONE", ExperienceScaling> = {
    BEGINNER: { intensityCap: 0.75, volumeMultiplier: 0.8, maxComplexity: 1, intensityLabel: "75% intensity cap" },
    INTERMEDIATE: { intensityCap: 0.85, volumeMultiplier: 1.0, maxComplexity: 2, intensityLabel: "85% intensity cap" },
    ADVANCED: { intensityCap: 0.95, volumeMultiplier: 1.15, maxComplexity: 3, intensityLabel: "95% intensity cap" },
    NONE: { intensityCap: 0.85, volumeMultiplier: 1.0, maxComplexity: 2, intensityLabel: "85% intensity cap" },
};

export function getExperienceScaling(experienceLevel: ExperienceLevel | undefined): ExperienceScaling {
    return EXPERIENCE_SCALING[experienceLevel ?? "NONE"];
}

// ── Exercise pool organised by block type × pattern ───────────────────────────
// Each entry: { name, complexity (1-3), unilateral?, isometric? }
// Pool is filtered by maxComplexity from experience scaling before use.

type ExerciseEntry = { name: string; complexity: 1 | 2 | 3; unilateral?: boolean; isometric?: boolean };

const BLOCK_EXERCISE_POOL: Record<BlockType, Record<Pattern, ExerciseEntry[]>> = {
    NEURAL_RESET: {
        squat: [
            { name: "Goblet Squat Hold", complexity: 1, isometric: true },
            { name: "Wall Sit", complexity: 1, isometric: true },
            { name: "Tempo Box Squat", complexity: 2 },
        ],
        hinge: [
            { name: "Hip Hinge (Bodyweight)", complexity: 1 },
            { name: "Isometric RDL Hold", complexity: 1, isometric: true },
            { name: "Tempo Kettlebell Deadlift", complexity: 2 },
        ],
        push: [
            { name: "Isometric Push-up Hold", complexity: 1, isometric: true },
            { name: "Wall Push-up (Tempo)", complexity: 1 },
            { name: "Floor Press (Slow Tempo)", complexity: 2 },
        ],
        pull: [
            { name: "Band Pull-apart", complexity: 1 },
            { name: "Isometric Row Hold", complexity: 1, isometric: true },
            { name: "Tempo Lat Pulldown", complexity: 2 },
        ],
    },
    CONTROL_UNDER_LOAD: {
        squat: [
            { name: "Single-Leg Box Squat", complexity: 1, unilateral: true },
            { name: "Rear-Foot Elevated Squat", complexity: 2, unilateral: true },
            { name: "Pause Front Squat", complexity: 3 },
        ],
        hinge: [
            { name: "Single-Leg Romanian Deadlift", complexity: 2, unilateral: true },
            { name: "Pause Deadlift", complexity: 2 },
            { name: "Copenhagen Plank", complexity: 2, unilateral: true },
        ],
        push: [
            { name: "DB Bench Press (Tempo)", complexity: 1 },
            { name: "Single-Arm DB Press", complexity: 2, unilateral: true },
            { name: "Pause Barbell Bench Press", complexity: 3 },
        ],
        pull: [
            { name: "Single-Arm DB Row", complexity: 1, unilateral: true },
            { name: "Tempo Neutral-Grip Pulldown", complexity: 2 },
            { name: "Pause Pull-up", complexity: 3 },
        ],
    },
    CAPACITY_BUILD: {
        squat: [
            { name: "Goblet Squat", complexity: 1 },
            { name: "Front Squat", complexity: 2 },
            { name: "Back Squat", complexity: 3 },
        ],
        hinge: [
            { name: "Kettlebell Deadlift", complexity: 1 },
            { name: "Romanian Deadlift", complexity: 2 },
            { name: "Barbell Deadlift", complexity: 3 },
        ],
        push: [
            { name: "DB Bench Press", complexity: 1 },
            { name: "Barbell Bench Press", complexity: 2 },
            { name: "Weighted Dip", complexity: 3 },
        ],
        pull: [
            { name: "Lat Pulldown", complexity: 1 },
            { name: "Neutral-Grip Pull-up", complexity: 2 },
            { name: "Weighted Pull-up", complexity: 3 },
        ],
    },
    PERFORMANCE: {
        squat: [
            { name: "Pause Back Squat", complexity: 2 },
            { name: "Competition Back Squat", complexity: 3 },
            { name: "Low-Bar Back Squat", complexity: 3 },
        ],
        hinge: [
            { name: "Barbell Deadlift", complexity: 2 },
            { name: "Sumo Deadlift", complexity: 3 },
            { name: "Trap Bar Deadlift", complexity: 3 },
        ],
        push: [
            { name: "Barbell Bench Press", complexity: 2 },
            { name: "Close-Grip Bench Press", complexity: 3 },
            { name: "Weighted Dip", complexity: 3 },
        ],
        pull: [
            { name: "Weighted Pull-up", complexity: 2 },
            { name: "Chest-Supported Row", complexity: 2 },
            { name: "Barbell Row", complexity: 3 },
        ],
    },
};

// Accessory pool — complementary movements per pattern
const PATTERN_ACCESSORY: Record<Pattern, [string, string]> = {
    squat: ["Copenhagen Plank", "Nordic Curl"],
    hinge: ["Glute Bridge", "Back Extension"],
    push: ["Face Pull", "Band Pull-apart"],
    pull: ["Pallof Press", "Dead Bug"],
};

// ── Block type derivation ─────────────────────────────────────────────────────
// Maps phase + session index to a block type for exercise pool selection.

export function deriveBlockType(block: StrengthBlock): BlockType {
    const { phase, completedSessions } = block;
    if (phase === 1) {
        return completedSessions <= 2 ? "NEURAL_RESET" : "CONTROL_UNDER_LOAD";
    }
    if (phase === 2) return "CAPACITY_BUILD";
    return "PERFORMANCE";
}

// ── Block factory ─────────────────────────────────────────────────────────────

export function createStrengthBlock(phase: BlockPhase, totalSessions: number = 10): StrengthBlock {
    return {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        phase,
        totalSessions,
        completedSessions: 0,
        patternHistory: { squat: 0, hinge: 0, push: 0, pull: 0 },
    };
}

export function isBlockComplete(block: StrengthBlock): boolean {
    return block.completedSessions >= block.totalSessions;
}

// ── Pattern rotation ──────────────────────────────────────────────────────────

export function selectPattern(block: StrengthBlock): Pattern {
    const { patternHistory, completedSessions } = block;
    if (completedSessions === 0) return "squat";

    const nextTotal = completedSessions + 1;
    const patterns: Pattern[] = ["squat", "hinge", "push", "pull"];
    const sorted = [...patterns].sort((a, b) => patternHistory[a] - patternHistory[b]);

    for (const p of sorted) {
        if ((patternHistory[p] + 1) / nextTotal <= 0.40) return p;
    }
    return sorted[0];
}

export function updateBlock(block: StrengthBlock, pattern: Pattern): StrengthBlock {
    return {
        ...block,
        completedSessions: block.completedSessions + 1,
        patternHistory: {
            ...block.patternHistory,
            [pattern]: block.patternHistory[pattern] + 1,
        },
    };
}

// ── Phase prescription ────────────────────────────────────────────────────────

export function getPhasePrescription(block: StrengthBlock): PhasePrescription {
    const { phase, completedSessions: idx, totalSessions: total } = block;
    const isFinal = idx === total - 1;

    if (phase === 1) {
        if (isFinal) return { sets: 2, reps: "8–10", tempo: "2-0-2-0", notes: "Technique bias. Volume −30%.", topSet: false, isDeload: true };
        if (idx <= 2) return { sets: 3, reps: "6–8", tempo: "3-1-1-0", notes: "Submaximal. Eccentric control.", topSet: false, isDeload: false };
        if (idx <= 6) return { sets: 4, reps: "6–8", tempo: "4-1-1-0", notes: "Pause variation.", topSet: false, isDeload: false };
        return { sets: 3, reps: "4–6", tempo: "3-1-1-0", notes: "Slight load increase.", topSet: false, isDeload: false };
    }

    if (phase === 2) {
        if (isFinal) return { sets: 2, reps: "8", tempo: "2-0-2-0", notes: "Deload — light.", topSet: false, isDeload: true };
        if (idx <= 2) return { sets: 3, reps: "8", tempo: "2-0-2-0", notes: "", topSet: false, isDeload: false };
        if (idx <= 5) return { sets: 4, reps: "8", tempo: "2-0-2-0", notes: "", topSet: false, isDeload: false };
        if (idx <= 7) return { sets: 4, reps: "6", tempo: "2-1-1-0", notes: "Heavier.", topSet: false, isDeload: false };
        return { sets: 3, reps: "5", tempo: "2-1-1-0", notes: "Heavier.", topSet: false, isDeload: false };
    }

    // Phase 3
    if (isFinal) return { sets: 2, reps: "6", tempo: "3-1-1-0", notes: "Reduced volume + neural reset.", topSet: false, isDeload: true };
    if (idx <= 1) return { sets: 4, reps: "5", tempo: "2-1-1-0", notes: "", topSet: false, isDeload: false };
    if (idx <= 5) return { sets: 4, reps: "4–5", tempo: "2-1-1-0", notes: "Top set + 2 back-off sets.", topSet: true, rpe: 8, backOffSets: 2, backOffReduction: 0.10, isDeload: false };
    if (idx <= 7) return { sets: 4, reps: "3–4", tempo: "2-1-1-0", notes: "Heavier top set.", topSet: true, rpe: 9, backOffSets: 2, backOffReduction: 0.10, isDeload: false };
    return { sets: 4, reps: "5", tempo: "1-0-1-0", notes: "Speed bias — explosive concentric.", topSet: false, isDeload: false };
}

// ── Readiness modifier ────────────────────────────────────────────────────────

export function applyReadinessModifier(
    prescription: PhasePrescription,
    neuralState: NeuralState,
): PhasePrescription {
    if (neuralState === "PRIMED" || neuralState === "ADAPTIVE") return prescription;

    if (neuralState === "STABLE") {
        return {
            ...prescription,
            sets: Math.max(1, prescription.sets - 1),
            notes: [prescription.notes, "Reduce load ~5%."].filter(Boolean).join(" "),
        };
    }

    return {
        ...prescription,
        sets: Math.max(1, Math.round(prescription.sets * 0.7)),
        reps: "8–10",
        tempo: "2-0-2-0",
        topSet: false,
        rpe: undefined,
        backOffSets: undefined,
        notes: "Recovery bias. Focus on movement quality.",
        isDeload: true,
    };
}

// ── Experience modifier (structural) ─────────────────────────────────────────
// Strips top sets for beginners. Bumps RPE ceiling for advanced.
// Volume multiplier and intensity cap are applied in sessionBuilder.

export function applyExperienceModifier(
    prescription: PhasePrescription,
    experienceLevel: ExperienceLevel | undefined,
): PhasePrescription {
    if (experienceLevel === "BEGINNER") {
        return {
            ...prescription,
            topSet: false,
            rpe: undefined,
            backOffSets: undefined,
            reps: prescription.reps.split(" @")[0],
            notes: [prescription.notes, "Focus on mechanics."].filter(Boolean).join(" "),
        };
    }
    if (experienceLevel === "ADVANCED" && prescription.topSet && prescription.rpe) {
        return {
            ...prescription,
            rpe: Math.min(prescription.rpe + 1, 9),
            notes: [prescription.notes, "Optional heavy bias."].filter(Boolean).join(" "),
        };
    }
    return prescription;
}

// ── Exercise selection (block type + complexity filtered) ─────────────────────

export function getPatternExercises(
    pattern: Pattern,
    blockType: BlockType,
    maxComplexity: 1 | 2 | 3,
): { primary: string; accessory: [string, string] } {
    const pool = BLOCK_EXERCISE_POOL[blockType][pattern];
    const eligible = pool.filter(e => e.complexity <= maxComplexity);
    // Pick the most complex eligible entry (highest challenge within cap)
    const chosen = eligible.length > 0 ? eligible[eligible.length - 1] : pool[0];
    return { primary: chosen.name, accessory: PATTERN_ACCESSORY[pattern] };
}

// ── Phase transition suggestion ───────────────────────────────────────────────

export function suggestNextPhase(
    block: StrengthBlock,
    experienceLevel: ExperienceLevel | undefined,
): PhaseTransitionSuggestion {
    if (block.phase === 1) {
        return { suggested: 2, reason: "Structural control phase complete. Tissue is prepared for higher capacity work." };
    }
    if (block.phase === 2) {
        if (experienceLevel === "BEGINNER") {
            return { suggested: 1, reason: "Capacity phase complete. A second structural cycle consolidates the base before performance work." };
        }
        return { suggested: 3, reason: "Capacity phase complete. Neural readiness supports transitioning to performance loading." };
    }
    return { suggested: 1, reason: "Performance phase complete. Structural reset restores tissue resilience for the next loading cycle." };
}
