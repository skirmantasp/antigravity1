import { CalibrationAdjustment } from "./adaptiveCalibration";

export type DecisionSeverity = "LOW" | "MEDIUM" | "HIGH";
export type CoachRiskProfile = "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";

export interface WeightedDecision {
    score: number;
    action: string;
    severity: DecisionSeverity;
    reasoning: string;
}

interface DecisionInput {
    neuralState: string;
    stability: string;
    momentum: string;
    balance: number;
    phase: string;
    riskProfile?: CoachRiskProfile;
    calibrationAdjustment?: CalibrationAdjustment;
}

interface ProfileModifiers {
    neuralMultiplier: number;
    stabilityPenaltyMultiplier: number;
    momentumMultiplier: number;
    balanceMultiplier: number;
}

const PROFILE_MODIFIERS: Record<CoachRiskProfile, ProfileModifiers> = {
    CONSERVATIVE: { neuralMultiplier: 1.2, stabilityPenaltyMultiplier: 1.2, momentumMultiplier: 0.8, balanceMultiplier: 1.0 },
    BALANCED: { neuralMultiplier: 1.0, stabilityPenaltyMultiplier: 1.0, momentumMultiplier: 1.0, balanceMultiplier: 1.0 },
    AGGRESSIVE: { neuralMultiplier: 0.8, stabilityPenaltyMultiplier: 0.8, momentumMultiplier: 1.2, balanceMultiplier: 1.1 },
};

const NEURAL_WEIGHTS: Record<string, number> = {
    PROTECTIVE: -3,
    STABLE: 0,
    ADAPTIVE: 2,
    PRIMED: 3,
};

const STABILITY_WEIGHTS: Record<string, number> = {
    LOW: -2,
    MODERATE: 0,
    HIGH: 2,
};

const MOMENTUM_WEIGHTS: Record<string, number> = {
    DOWN: -1,
    FLAT: 0,
    UP: 1,
};

function getBalanceWeight(balance: number): number {
    if (balance < 0) return -2;
    if (balance <= 5) return 0;
    if (balance <= 15) return 1;
    return 2;
}

function getBalanceLabel(weight: number): string {
    if (weight === -2) return `negative balance (${weight})`;
    if (weight === 0) return `neutral balance (${weight})`;
    if (weight === 1) return `positive balance (+${weight})`;
    return `strong balance (+${weight})`;
}

function fmt(n: number): string {
    const r = Math.round(n * 10) / 10;
    return r >= 0 ? `+${r}` : `${r}`;
}

export function deriveWeightedDecision(input: DecisionInput): WeightedDecision {
    const { neuralState, stability, momentum, balance, phase, riskProfile = "BALANCED", calibrationAdjustment } = input;
    const mod = PROFILE_MODIFIERS[riskProfile];

    const rawNeuralW = NEURAL_WEIGHTS[neuralState] ?? 0;
    const rawStabilityW = STABILITY_WEIGHTS[stability] ?? 0;
    const rawMomentumW = MOMENTUM_WEIGHTS[momentum] ?? 0;
    const rawBalanceW = getBalanceWeight(balance);

    // Apply multipliers — stability penalty multiplier only applies to negative stability weights
    const neuralW = rawNeuralW * mod.neuralMultiplier;
    const stabilityW = rawStabilityW < 0
        ? rawStabilityW * mod.stabilityPenaltyMultiplier
        : rawStabilityW;
    const momentumW = rawMomentumW * mod.momentumMultiplier;
    const balanceW = rawBalanceW * mod.balanceMultiplier;

    let score = neuralW + stabilityW + momentumW + balanceW;

    // Phase modifiers
    if (phase === "NEURAL_RESET") {
        score -= 1;
    }
    if (phase === "REINTEGRATION" && neuralState === "PRIMED") {
        score += 1;
    }

    // Adaptive calibration adjustment (blocked for PROTECTIVE)
    let calibrationNote = "";
    if (calibrationAdjustment && neuralState !== "PROTECTIVE") {
        const rawShift = calibrationAdjustment.neuralAdjustment + calibrationAdjustment.momentumAdjustment;
        const clampedShift = Math.max(-1, Math.min(1, rawShift));
        score += clampedShift;
        if (calibrationAdjustment.explanation) {
            calibrationNote = " " + calibrationAdjustment.explanation;
        }
    }

    score = Math.round(score * 10) / 10;

    // Reasoning
    const neuralPart = mod.neuralMultiplier !== 1
        ? `${neuralState} (${fmt(rawNeuralW)} ×${mod.neuralMultiplier}=${fmt(neuralW)})`
        : `${neuralState} (${fmt(rawNeuralW)})`;

    const stabilityPart = (rawStabilityW < 0 && mod.stabilityPenaltyMultiplier !== 1)
        ? `${stability} stability (${fmt(rawStabilityW)} ×${mod.stabilityPenaltyMultiplier}=${fmt(stabilityW)})`
        : `${stability} stability (${fmt(stabilityW)})`;

    const momentumPart = mod.momentumMultiplier !== 1
        ? `${momentum} momentum (${fmt(rawMomentumW)} ×${mod.momentumMultiplier}=${fmt(momentumW)})`
        : `${momentum} momentum (${fmt(momentumW)})`;

    const balancePart = mod.balanceMultiplier !== 1
        ? `${getBalanceLabel(rawBalanceW).replace(`(${rawBalanceW})`, `(${fmt(rawBalanceW)} ×${mod.balanceMultiplier}=${fmt(balanceW)})`).replace(`(+${rawBalanceW})`, `(${fmt(rawBalanceW)} ×${mod.balanceMultiplier}=${fmt(balanceW)})`)}`
        : getBalanceLabel(rawBalanceW);

    const phaseNote = phase === "NEURAL_RESET"
        ? " Neural Reset phase modifier (−1)."
        : phase === "REINTEGRATION" && neuralState === "PRIMED"
            ? " Reintegration + Primed bonus (+1)."
            : "";

    const reasoning =
        `Profile: ${riskProfile}. ` +
        `${neuralPart}, ${stabilityPart}, ${momentumPart}, ${balancePart}.` +
        `${phaseNote}${calibrationNote} Final score: ${score}.`;

    // Score mapping
    let action: string;
    let severity: DecisionSeverity;

    if (score <= -3) {
        action = "Regulate System";
        severity = "HIGH";
    } else if (score <= 0) {
        action = "Hold Structure";
        severity = "MEDIUM";
    } else if (score <= 3) {
        action = "Progress Carefully";
        severity = "MEDIUM";
    } else {
        action = "High Output Allowed";
        severity = "LOW";
    }

    return { score, action, severity, reasoning };
}
