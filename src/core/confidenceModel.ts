export interface ConfidenceResult {
    finalConfidence: number;
    volatilityLevel: number;
    explanation: string;
}

interface ConfidenceInput {
    score: number;
    readinessHistory: number[];      // last 3–5 readiness values
    balanceHistory: number[];        // last 3–5 balance values (used for AC ratio)
    momentumHistory: string[];       // e.g. ["UP", "FLAT", "DOWN"] — last 3–5 direction values
    overrideRate: number;            // 0.0–1.0 fraction of sessions overridden
}

/** Map abs(score) → 60–95 range */
function baseConfidence(score: number): number {
    const abs = Math.abs(score);
    if (abs >= 8) return 95;
    // Linear scale: 0 → 60, 8 → 95
    return Math.round(60 + (abs / 8) * 35);
}

/** Count direction changes in an array of strings */
function countDirectionChanges(directions: string[]): number {
    let changes = 0;
    for (let i = 1; i < directions.length; i++) {
        if (directions[i] !== directions[i - 1]) changes++;
    }
    return changes;
}

export function calculateConfidence(input: ConfidenceInput): ConfidenceResult {
    const { score, readinessHistory, balanceHistory, momentumHistory, overrideRate } = input;

    let base = baseConfidence(score);
    let volatilityLevel = 0;
    const reasons: string[] = [];

    // 1. Readiness fluctuation
    if (readinessHistory.length >= 2) {
        const max = Math.max(...readinessHistory);
        const min = Math.min(...readinessHistory);
        if (max - min > 20) {
            volatilityLevel++;
            reasons.push("readiness fluctuation >20pts");
        }
    }

    // 2. Momentum direction changes
    if (countDirectionChanges(momentumHistory) >= 2) {
        volatilityLevel++;
        reasons.push("momentum changed direction 2+ times");
    }

    // 3. AC ratio (balance as proxy: high positive = high recovery, low/negative = imbalanced)
    if (balanceHistory.length >= 1) {
        const lastBalance = balanceHistory[balanceHistory.length - 1];
        // AC ratio proxy: if balance is extremely high (>15) or negative (<0), flag it
        if (lastBalance > 15 || lastBalance < 0) {
            volatilityLevel++;
            reasons.push("AC ratio out of range");
        }
    }

    // 4. Override rate
    if (overrideRate > 0.30) {
        volatilityLevel++;
        reasons.push("override rate >30%");
    }

    // Volatility modifier
    const penalty =
        volatilityLevel === 1 ? 5 :
            volatilityLevel === 2 ? 10 :
                volatilityLevel >= 3 ? 15 : 0;

    const finalConfidence = Math.max(50, Math.min(95, base - penalty));

    const explanation =
        volatilityLevel === 0
            ? `Score-based confidence: ${base}%. No volatility detected.`
            : `Score-based confidence: ${base}%. Volatility factors (${reasons.join(", ")}) applied −${penalty}%. Final: ${finalConfidence}%.`;

    return { finalConfidence, volatilityLevel, explanation };
}

/** Convert finalConfidence to a level label */
export function confidenceToLevel(confidence: number): "HIGH" | "MODERATE" | "LOW" {
    if (confidence >= 75) return "HIGH";
    if (confidence >= 60) return "MODERATE";
    return "LOW";
}
