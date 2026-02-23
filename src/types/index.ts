export type Phase = "NEURAL_RESET" | "CONTROL_UNDER_LOAD" | "REINTEGRATION";
export type InjuryStatus = "HEALTHY" | "MANAGING" | "INJURED";
export type Role = "COACH" | "ATHLETE";
export type SportContext = "STRENGTH" | "ENDURANCE" | "REHAB" | "TEAM" | "GENERAL";
export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ProfileStatus = "NONE" | "RECOVERING" | "LIMITED";

export type { NeuralState, AdaptationMode } from "../core/trainingEngine";
import type { NeuralState, AdaptationMode } from "../core/trainingEngine";

export type { StrengthBlock, BlockPhase, Pattern, PatternHistory, PhasePrescription, PhaseTransitionSuggestion } from "./strengthBlock";
import type { StrengthBlock } from "./strengthBlock";

export interface EngineOutput {
    intensityModifier: number;
    volumeModifier: number;
    focus: string;
    phase: Phase;
    neuralState: NeuralState;
    adaptationMode: AdaptationMode;
    recommendedMode: AdaptationMode;
    finalMode: AdaptationMode;
    balance: number;
    isOverridden: boolean;
    warningLevel: string | null;
}

export type LogType = "LOAD" | "BODYWEIGHT" | "TIME" | "BREATHING";

export interface Block {
    name: string;
    sets: number;
    reps: string;
    tempo?: string;
    rest: string;
    logType?: LogType;   // defaults to "LOAD" when absent
}

export interface Session {
    warmup: Block[];
    main: Block[];
    accessory: Block[];
    breathing: Block[];
    totalEstimatedTime: number;
}

export interface AthleteHistory {
    date: string;
    readiness: number;
    volume: number;
    injuryFlag: boolean;
    balance?: number;
}

export interface Athlete {
    id: string;
    name: string;
    readinessScore: number;
    injuryStatus: InjuryStatus;  // engine field — do not modify
    phase: Phase;                // engine field — do not modify
    // ── Athlete Profile v1 ────────────────────────────────
    sportContext?: SportContext;     // default: "GENERAL"
    experienceLevel?: ExperienceLevel;
    profileStatus?: ProfileStatus;    // presentation-layer only, not engine input
    notes?: string;
    // ── Strength Block v1 ─────────────────────────────────
    strengthBlock?: StrengthBlock;   // undefined = no active block
    // ── Load monitoring (recalculated on session completion) ──
    acuteLoad?: number;              // sum of effectiveVolume, last 7 sessions
    chronicLoad?: number;            // rolling mean, last 28 sessions
    acRatio?: number;                // acuteLoad / chronicLoad; null when no history
    // ──────────────────────────────────────────────
    history: AthleteHistory[];
}
