import { Block, EngineOutput, Session } from "../types";
import type { ExperienceLevel } from "../types";
import type { StrengthBlock, PhaseTransitionSuggestion } from "../types/strengthBlock";
import { applyExperienceDosing, ComplexityLevel } from "./experienceDosing";
import {
    getPhasePrescription, applyReadinessModifier, applyExperienceModifier,
    selectPattern, updateBlock, isBlockComplete, suggestNextPhase,
    getPatternExercises, getExperienceScaling, deriveBlockType,
} from "./strengthBlockEngine";
import { calculateEffectiveVolume, EffectiveVolumeBlockType } from "./effectiveVolume";

// ── Return type ───────────────────────────────────────────────────────────────

export interface BuildSessionResult {
    session: Session;
    updatedBlock?: StrengthBlock;
    phaseTransition?: PhaseTransitionSuggestion;
    effectiveVolume?: number;
    blockType?: EffectiveVolumeBlockType;
}

// ── Legacy exercise library (used when no strength block is active) ────────────

const EXERCISE_LIBRARY: Record<string, string[]> = {
    "Regeneration": ["90/90 Breathing", "Cat-Cow", "Thoracic Reach-Through", "Box Breathing"],
    "Neural Reset": ["Isometric Squat", "Isometric Push-up Hold", "Dead Bug", "Diaphragmatic Breathing"],
    "CONTROL UNDER LOAD": ["Goblet Squat", "DB Bench Press", "Suitcase Carry", "Copenhagen Plank"],
    "Strength Under Control": ["Back Squat", "Weighted Pull-up", "RDL", "Pallof Press"],
    "NEURAL RESET": ["Pelvic Tilt", "Leg Lowering", "Quadruped Rocking", "Physioball Squeeze"],
    "REINTEGRATION": ["Single Leg RDL", "Bear Crawl", "Turkish Get Up", "COKE Plank"],
};

const COMPLEXITY_SLICE: Record<ComplexityLevel, number> = { SIMPLE: 2, STANDARD: 4, ADVANCED: 4 };

const selectExercises = (focus: string, complexityLevel: ComplexityLevel): string[] => {
    const pool = EXERCISE_LIBRARY[focus] || EXERCISE_LIBRARY["CONTROL UNDER LOAD"];
    return pool.slice(0, COMPLEXITY_SLICE[complexityLevel]);
};

// ── Block-aware session builder ───────────────────────────────────────────────

function buildBlockSession(
    engineOutput: EngineOutput,
    block: StrengthBlock,
    experienceLevel: ExperienceLevel | undefined,
): BuildSessionResult {
    // ── Step 1: Experience scaling (applied BEFORE session build) ─────────────
    const scaling = getExperienceScaling(experienceLevel);

    // ── Step 2: Phase prescription ────────────────────────────────────────────
    let prescription = getPhasePrescription(block);

    // ── Step 3: Apply readiness modifier (dose only — does not change phase) ──
    prescription = applyReadinessModifier(prescription, engineOutput.neuralState);

    // ── Step 4: Apply experience modifier (top set / RPE stripping) ───────────
    prescription = applyExperienceModifier(prescription, experienceLevel);

    // ── Step 5: Apply volume multiplier from experience scaling ───────────────
    // intensityCap is reflected in notes since we don't track numeric load.
    const scaledSets = Math.max(1, Math.round(prescription.sets * scaling.volumeMultiplier));
    const prescriptionWithScaling: typeof prescription = {
        ...prescription,
        sets: scaledSets,
        notes: [prescription.notes, scaling.intensityLabel].filter(Boolean).join(". "),
    };

    // ── Step 6: Derive block type for exercise pool filtering ─────────────────
    const blockType = deriveBlockType(block);

    // ── Step 7: Pattern + exercise selection (filtered by blockType + maxComplexity) ──
    const pattern = selectPattern(block);
    const { primary, accessory } = getPatternExercises(pattern, blockType, scaling.maxComplexity);

    // ── Step 8: Build main blocks ─────────────────────────────────────────────
    const mainBlocks: Block[] = [];

    if (prescriptionWithScaling.topSet) {
        const rpeLabel = prescriptionWithScaling.rpe ? ` @RPE ${prescriptionWithScaling.rpe}` : "";
        mainBlocks.push({
            name: primary,
            sets: 1,
            reps: `${prescriptionWithScaling.reps}${rpeLabel}`,
            tempo: prescriptionWithScaling.tempo,
            rest: "3min",
            logType: "LOAD",
        });
        mainBlocks.push({
            name: `${primary} (back-off)`,
            sets: prescriptionWithScaling.backOffSets ?? 2,
            reps: prescriptionWithScaling.reps.split(" @")[0],
            tempo: prescriptionWithScaling.tempo,
            rest: "2min",
            logType: "LOAD",
        });
    } else {
        mainBlocks.push({ name: primary, sets: prescriptionWithScaling.sets, reps: prescriptionWithScaling.reps, tempo: prescriptionWithScaling.tempo, rest: "90s", logType: "LOAD" });
        mainBlocks.push({ name: primary, sets: prescriptionWithScaling.sets, reps: prescriptionWithScaling.reps, tempo: prescriptionWithScaling.tempo, rest: "90s", logType: "LOAD" });
    }

    // ── Step 9: Accessory blocks (1 for BEGINNER, 2 otherwise) ───────────────
    const accessoryCount = experienceLevel === "BEGINNER" ? 1 : 2;
    const accessoryBlocks: Block[] = accessory.slice(0, accessoryCount).map(name => ({
        name,
        sets: Math.max(1, Math.round(2 * Math.min(engineOutput.volumeModifier, 1.0) * scaling.volumeMultiplier)),
        reps: "10–12",
        tempo: "2-0-2-0",
        rest: "60s",
        logType: "BODYWEIGHT" as const,
    }));

    // ── Step 10: Effective volume calculation ─────────────────────────────────
    const ev = calculateEffectiveVolume([...mainBlocks, ...accessoryBlocks], blockType);

    // ── Step 11: Update block state ───────────────────────────────────────────
    const updatedBlock = updateBlock(block, pattern);
    const blockComplete = isBlockComplete(updatedBlock);
    const phaseTransition = blockComplete ? suggestNextPhase(block, experienceLevel) : undefined;

    const session: Session = {
        warmup: [
            { name: "Diaphragmatic Breathing", sets: 1, reps: "5 min", rest: "None" },
            { name: "Cat-Cow", sets: 2, reps: "10", tempo: "2-0-2-0", rest: "30s" },
        ],
        main: mainBlocks,
        accessory: accessoryBlocks,
        breathing: [
            { name: "Box Breathing", sets: 1, reps: "5 min", rest: "None" },
        ],
        totalEstimatedTime: Math.round(50 * Math.min(engineOutput.volumeModifier, 1.0) * scaling.volumeMultiplier),
    };

    return { session, updatedBlock, phaseTransition, effectiveVolume: ev, blockType };
}

// ── Legacy (non-block) session builder ───────────────────────────────────────

function buildLegacySession(
    engineOutput: EngineOutput,
    experienceLevel: ExperienceLevel | undefined,
): BuildSessionResult {
    const { focus, volumeModifier, adaptationMode } = engineOutput;

    const decisionType: "PROGRESS" | "CONTROLLED" | "REDUCE" =
        adaptationMode === "PROVOKE" || adaptationMode === "ADAPT" ? "PROGRESS"
            : adaptationMode === "REGULATE" ? "REDUCE"
                : "CONTROLLED";

    const dosing = applyExperienceDosing(decisionType, experienceLevel);
    const effectiveVolume = Math.min(volumeModifier, dosing.volumeCap);
    const exercises = selectExercises(focus, dosing.complexityLevel);

    const createBlock = (name: string, isMain: boolean = false, logType: Block["logType"] = isMain ? "LOAD" : "BODYWEIGHT"): Block => ({
        name,
        sets: Math.max(1, Math.round((isMain ? 3 : 2) * effectiveVolume * dosing.loadAdjustment)),
        reps: isMain ? "5-8" : "10-12",
        tempo: isMain ? dosing.tempoControl : "2-0-2-0",
        rest: isMain ? "90s" : "60s",
        logType,
    });

    return {
        session: {
            warmup: [
                createBlock("Diaphragmatic Breathing", false, "BREATHING"),
                createBlock("Cat-Cow", false, "BODYWEIGHT"),
            ],
            main: [
                createBlock(exercises[0] ?? "Goblet Squat", true),
                createBlock(exercises[1] ?? "DB Bench Press", true),
            ],
            accessory: [
                createBlock(exercises[2] ?? "Dead Bug", false, "BODYWEIGHT"),
                createBlock(exercises[3] ?? "Bird Dog", false, "BODYWEIGHT"),
            ],
            breathing: [
                { name: "Box Breathing", sets: 1, reps: "5 min", rest: "None", logType: "BREATHING" },
            ],
            totalEstimatedTime: Math.round(45 * effectiveVolume),
        },
    };
}

// ── Public API ────────────────────────────────────────────────────────────────

export const buildSession = (
    engineOutput: EngineOutput,
    experienceLevel?: ExperienceLevel,
    strengthBlock?: StrengthBlock,
): BuildSessionResult => {
    if (strengthBlock && !isBlockComplete(strengthBlock)) {
        return buildBlockSession(engineOutput, strengthBlock, experienceLevel);
    }
    return buildLegacySession(engineOutput, experienceLevel);
};
