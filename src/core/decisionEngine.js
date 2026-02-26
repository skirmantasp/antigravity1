import { TRAINING_STATES } from "./constants.js";

export function decideState(athlete) {

    if (!athlete) {
        return "UNKNOWN";
    }

    if (!athlete.stable) {
        return TRAINING_STATES.STABILIZE;
    }

    if (athlete.baseNeeded) {
        return TRAINING_STATES.CONTROL;
    }

    return TRAINING_STATES.PROGRESS;
}
