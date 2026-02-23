export interface OverrideHistoryEntry {
    date: string;
    recommendedMode: string;
    finalMode: string;
}

export interface CalibrationAdjustment {
    neuralAdjustment: number;
    momentumAdjustment: number;
    explanation: string | null;
}

const MODE_RANK: Record<string, number> = {
    REGULATE: 1,
    STABILIZE: 2,
    ADAPT: 3,
    PROVOKE: 4,
};

export function deriveCalibrationAdjustment(
    overrideHistory: OverrideHistoryEntry[]
): CalibrationAdjustment {
    const noAdjustment: CalibrationAdjustment = {
        neuralAdjustment: 0,
        momentumAdjustment: 0,
        explanation: null,
    };

    if (overrideHistory.length < 10) return noAdjustment;

    let upCount = 0; // coach consistently increased load
    let downCount = 0; // coach consistently decreased load

    for (const entry of overrideHistory) {
        const recommended = MODE_RANK[entry.recommendedMode] ?? 0;
        const final = MODE_RANK[entry.finalMode] ?? 0;

        if (final > recommended) upCount++;
        else if (final < recommended) downCount++;
    }

    const total = overrideHistory.length;
    const threshold = total * 0.7;

    if (upCount >= threshold) {
        // System is too conservative — coach keeps pushing higher
        return {
            neuralAdjustment: -0.2,
            momentumAdjustment: +0.1,
            explanation: "Adaptive calibration applied due to consistent override trend.",
        };
    }

    if (downCount >= threshold) {
        // System is too aggressive — coach keeps pulling lower
        return {
            neuralAdjustment: +0.2,
            momentumAdjustment: -0.1,
            explanation: "Adaptive calibration applied due to consistent override trend.",
        };
    }

    return noAdjustment;
}
