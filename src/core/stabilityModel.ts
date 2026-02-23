export type StabilityLevel = "HIGH" | "MODERATE" | "LOW";

export function calculateStability(lastBalances: number[]): {
    stabilityScore: number;
    stabilityLevel: StabilityLevel;
} {
    if (lastBalances.length < 3) {
        return { stabilityScore: 0, stabilityLevel: "LOW" };
    }

    const mean =
        lastBalances.reduce((a, b) => a + b, 0) / lastBalances.length;

    const variance =
        lastBalances.reduce((sum, value) => {
            return sum + Math.pow(value - mean, 2);
        }, 0) / lastBalances.length;

    const stabilityScore = Math.max(0, 100 - variance);

    if (variance < 10) {
        return { stabilityScore, stabilityLevel: "HIGH" };
    }

    if (variance < 30) {
        return { stabilityScore, stabilityLevel: "MODERATE" };
    }

    return { stabilityScore, stabilityLevel: "LOW" };
}
