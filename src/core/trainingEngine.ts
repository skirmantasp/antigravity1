import { EngineOutput, InjuryStatus, Phase } from "../types";

export type NeuralState = "PROTECTIVE" | "STABLE" | "ADAPTIVE" | "PRIMED";
export type AdaptationMode = "REGULATE" | "STABILIZE" | "ADAPT" | "PROVOKE";

const deriveNeuralState = (
    strain: number,
    recovery: number,
    injuryStatus: InjuryStatus
): NeuralState => {
    if (injuryStatus === "INJURED") return "PROTECTIVE";
    if (strain > recovery + 3) return "PROTECTIVE";
    if (recovery > strain + 6 && strain <= 9) return "PRIMED";
    if (recovery > strain) return "ADAPTIVE";
    return "STABLE";
};

const PHASE_NEURAL_MATRIX: Record<NeuralState, Record<Phase, AdaptationMode>> = {
    PROTECTIVE: {
        NEURAL_RESET: "REGULATE",
        CONTROL_UNDER_LOAD: "REGULATE",
        REINTEGRATION: "REGULATE",
    },
    STABLE: {
        NEURAL_RESET: "STABILIZE",
        CONTROL_UNDER_LOAD: "STABILIZE",
        REINTEGRATION: "ADAPT",
    },
    ADAPTIVE: {
        NEURAL_RESET: "ADAPT",
        CONTROL_UNDER_LOAD: "ADAPT",
        REINTEGRATION: "PROVOKE",
    },
    PRIMED: {
        NEURAL_RESET: "ADAPT",
        CONTROL_UNDER_LOAD: "PROVOKE",
        REINTEGRATION: "PROVOKE",
    },
};

const ADAPTATION_MAP: Record<AdaptationMode, { intensity: number; volume: number }> = {
    REGULATE: { intensity: 0.6, volume: 0.7 },
    STABILIZE: { intensity: 0.75, volume: 0.9 },
    ADAPT: { intensity: 0.85, volume: 1.0 },
    PROVOKE: { intensity: 0.95, volume: 0.9 },
};

const MODE_RANK: Record<AdaptationMode, number> = {
    REGULATE: 0,
    STABILIZE: 1,
    ADAPT: 2,
    PROVOKE: 3,
};


const getMaxAllowed = (neuralState: NeuralState, phase: Phase): AdaptationMode => {
    switch (neuralState) {
        case "PROTECTIVE": return "REGULATE";
        case "STABLE": return "STABILIZE";
        case "ADAPTIVE": return phase === "REINTEGRATION" ? "PROVOKE" : "ADAPT";
        case "PRIMED": return "PROVOKE";
    }
};

const deriveFocus = (finalMode: AdaptationMode, phase: Phase): string => {
    if (finalMode === "REGULATE") return "Regeneration";
    if (finalMode === "STABILIZE") return "Neural Reset";
    if (finalMode === "PROVOKE" && phase === "CONTROL_UNDER_LOAD") return "Strength Under Control";
    return phase.replace(/_/g, " ");
};

export const calculateTrainingParameters = (
    sleep: number,
    fatigue: number,
    stress: number,
    soreness: number,
    injuryStatus: InjuryStatus,
    phase: Phase,
    overrideMode?: AdaptationMode
): EngineOutput => {
    const strain = fatigue + stress + soreness;
    const recovery = sleep * 3;
    const balance = recovery - strain;

    const neuralState = deriveNeuralState(strain, recovery, injuryStatus);
    const recommendedMode = PHASE_NEURAL_MATRIX[neuralState][phase];

    let finalMode = recommendedMode;
    let isOverridden = false;
    let warningLevel: string | null = null;

    if (overrideMode) {
        isOverridden = true;
        const maxAllowed = getMaxAllowed(neuralState, phase);
        if (MODE_RANK[overrideMode] > MODE_RANK[maxAllowed]) {
            finalMode = maxAllowed;
            warningLevel = "NEURAL_LOAD_EXCEEDED";
        } else {
            finalMode = overrideMode;
        }
    }

    const { intensity, volume } = ADAPTATION_MAP[finalMode];
    const focus = deriveFocus(finalMode, phase);

    return {
        intensityModifier: intensity,
        volumeModifier: volume,
        focus,
        phase,
        neuralState,
        adaptationMode: finalMode,
        recommendedMode,
        finalMode,
        balance,
        isOverridden,
        warningLevel,
    };
};
