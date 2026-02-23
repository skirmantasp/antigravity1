export type BlockPhase = 1 | 2 | 3;
export type Pattern = "squat" | "hinge" | "push" | "pull";

export interface PatternHistory {
    squat: number;
    hinge: number;
    push: number;
    pull: number;
}

export interface StrengthBlock {
    id: string;
    phase: BlockPhase;
    totalSessions: number;
    completedSessions: number;
    patternHistory: PatternHistory;
}

export interface PhaseTransitionSuggestion {
    suggested: BlockPhase;
    reason: string;
}

export interface PhasePrescription {
    sets: number;
    reps: string;
    tempo: string;
    notes: string;
    topSet: boolean;
    rpe?: number;
    backOffSets?: number;
    backOffReduction?: number;
    isDeload: boolean;
}
