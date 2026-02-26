import { decideState } from "./decisionEngine.js";
import { getActions } from "./stateActions.js";

export function getTrainingState(athlete) {
    if (!athlete) {
        return "UNKNOWN";
    }

    return decideState(athlete);
}

/**
 * Returns a combined decision result: state + recommended actions.
 *
 * @param {object} athlete - The athlete profile object.
 * @returns {{ state: string, actions: object }}
 */
export function getDecisionResult(athlete) {
    const state = getTrainingState(athlete);
    const actions = getActions(state);

    return { state, actions };
}
