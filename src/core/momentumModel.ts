export type MomentumDirection = "UP" | "DOWN" | "FLAT";

export function calculateMomentum(lastBalances: number[]): {
    momentumDirection: MomentumDirection;
    momentumStrength: number;
} {
    if (lastBalances.length < 3) {
        return { momentumDirection: "FLAT", momentumStrength: 0 };
    }

    const first = lastBalances[0];
    const last = lastBalances[lastBalances.length - 1];

    const delta = last - first;
    const momentumStrength = Math.abs(delta);

    if (delta > 5) {
        return { momentumDirection: "UP", momentumStrength };
    }

    if (delta < -5) {
        return { momentumDirection: "DOWN", momentumStrength };
    }

    return { momentumDirection: "FLAT", momentumStrength };
}
