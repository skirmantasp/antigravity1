import { NeuralState, AdaptationMode } from "./trainingEngine";
import { Phase } from "../types";

interface CoachInsightInput {
    neuralState: NeuralState;
    balance: number;
    recommendedMode: AdaptationMode;
    finalMode: AdaptationMode;
    phase: Phase;
    isOverridden: boolean;
    warningLevel?: string | null;
}

interface CoachInsight {
    systemStatus: string;
    interpretation: string;
    coachingDirective: string;
    overrideNote?: string;
    whyNotHigher?: string;
}

const INSIGHT_MAP: Record<NeuralState, { systemStatus: string; coachingDirective: string }> = {
    PROTECTIVE: {
        systemStatus: "Nervous system is operating in protective mode.",
        coachingDirective: "Shift session toward regulation. Restore breathing rhythm, joint control, and movement quality. Avoid provocation.",
    },
    STABLE: {
        systemStatus: "System is stable but not in adaptive window.",
        coachingDirective: "Reinforce structure. Improve control under load. Avoid unnecessary intensity increases.",
    },
    ADAPTIVE: {
        systemStatus: "System is in adaptive integration state.",
        coachingDirective: "Progress load systematically. Emphasize technical quality.",
    },
    PRIMED: {
        systemStatus: "System is primed for high neural output.",
        coachingDirective: "High-quality provocation is allowed within phase constraints. Maintain technical precision.",
    },
};

const getBalanceZone = (balance: number) => {
    if (balance < 0) return "DEFICIT";
    if (balance <= 5) return "NEUTRAL";
    if (balance <= 12) return "ADAPTIVE";
    if (balance <= 20) return "HIGH_ADAPTIVE";
    return "SURPLUS";
};

const buildNeuralReasoning = (
    balance: number,
    phase: string,
    finalMode: string,
    recommendedMode: string
): string => {
    const zone = getBalanceZone(balance);
    let reasoning = "";

    switch (zone) {
        case "DEFICIT":
            reasoning += "Recovery is below strain. The system is compensating. ";
            break;
        case "NEUTRAL":
            reasoning += "Recovery and strain are closely matched. ";
            break;
        case "ADAPTIVE":
            reasoning += "Recovery moderately exceeds strain. Adaptive window is open. ";
            break;
        case "HIGH_ADAPTIVE":
            reasoning += "Recovery strongly exceeds strain. High adaptive potential present. ";
            break;
        case "SURPLUS":
            reasoning += "Large recovery reserve available. Neural output can be challenged. ";
            break;
    }

    if (phase === "NEURAL_RESET") {
        reasoning += "Current phase prioritizes regulation and neural control. ";
    }

    if (phase === "CONTROL_UNDER_LOAD") {
        reasoning += "Phase targets structural control under load. ";
    }

    if (phase === "REINTEGRATION") {
        reasoning += "Phase allows higher integration and progressive stimulus. ";
    }

    reasoning += `Selected mode: ${finalMode}. `;

    if (finalMode !== recommendedMode) {
        reasoning += `System limited progression from ${recommendedMode} due to neural constraints. `;
    }

    return reasoning;
};

const explainWhyNotHigher = (
    balance: number,
    finalMode: string
): string | null => {
    const zone = getBalanceZone(balance);

    if (zone === "ADAPTIVE" && finalMode !== "PROVOKE") {
        return "System is adaptive but not in high neural surplus. Provocation would exceed optimal adaptation window.";
    }

    if (zone === "NEUTRAL") {
        return "System stability does not justify higher intensity progression.";
    }

    if (zone === "DEFICIT") {
        return "Recovery deficit prevents safe intensity escalation.";
    }

    return null;
};

export function deriveCoachInsight(params: CoachInsightInput): CoachInsight {
    const { neuralState, balance, phase, recommendedMode, finalMode, warningLevel } = params;
    const base = INSIGHT_MAP[neuralState];

    const interpretation = buildNeuralReasoning(
        balance,
        phase,
        finalMode,
        recommendedMode
    );

    const whyNotHigher = explainWhyNotHigher(balance, finalMode);

    return {
        systemStatus: base.systemStatus,
        interpretation,
        coachingDirective: base.coachingDirective,
        overrideNote: warningLevel === "NEURAL_LOAD_EXCEEDED"
            ? "System prevented excessive neural load beyond safe threshold."
            : undefined,
        ...(whyNotHigher ? { whyNotHigher } : {}),
    };
}
