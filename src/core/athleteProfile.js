export function createAthleteProfile(data) {
    const defaults = {
        id: "",
        name: "",
        sport: "",
        level: "beginner",
        goals: [],
        limitations: [],
        stable: true,
        baseNeeded: false,
        fatigueLevel: 0,
        trainingHistory: [],
        injuryHistory: [],
        notes: "",
    };

    return { ...defaults, ...data };
}
