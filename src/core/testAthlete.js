import { createAthleteProfile } from "./athleteProfile.js";
import { getDecisionResult } from "./trainingState.js";

const athlete = createAthleteProfile({
    name: "Demo Athlete",
    sport: "running",
    stable: true,
    baseNeeded: true,
});

const result = getDecisionResult(athlete);

console.log("RESULT:", result);

