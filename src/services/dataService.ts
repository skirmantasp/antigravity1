import { Athlete } from "../types";

let athletes: Athlete[] = [
    {
        id: "1",
        name: "Alex Johnson",
        readinessScore: 82,
        injuryStatus: "HEALTHY",
        phase: "CONTROL_UNDER_LOAD",
        sportContext: "STRENGTH",
        experienceLevel: "ADVANCED",
        profileStatus: "NONE",
        notes: "",
        strengthBlock: {
            id: "block-alex-1",
            phase: 2,
            totalSessions: 9,
            completedSessions: 5,
            patternHistory: { squat: 2, hinge: 2, push: 1, pull: 0 },
        },
        history: [
            { date: "2026-02-11", readiness: 75, volume: 4500, injuryFlag: false },
            { date: "2026-02-12", readiness: 80, volume: 4800, injuryFlag: false },
            { date: "2026-02-13", readiness: 78, volume: 4200, injuryFlag: false },
            { date: "2026-02-14", readiness: 85, volume: 5100, injuryFlag: false },
            { date: "2026-02-15", readiness: 82, volume: 4900, injuryFlag: false },
            { date: "2026-02-16", readiness: 65, volume: 3000, injuryFlag: false },
            { date: "2026-02-17", readiness: 82, volume: 0, injuryFlag: false },
        ],
    },
    {
        id: "2",
        name: "Sarah Miller",
        readinessScore: 45,
        injuryStatus: "MANAGING",
        phase: "NEURAL_RESET",
        sportContext: "REHAB",
        experienceLevel: "INTERMEDIATE",
        profileStatus: "RECOVERING",
        notes: "Hamstring load management — avoid single-leg work at pace.",
        history: [
            { date: "2026-02-11", readiness: 55, volume: 2000, injuryFlag: false },
            { date: "2026-02-12", readiness: 52, volume: 2100, injuryFlag: false },
            { date: "2026-02-13", readiness: 50, volume: 1800, injuryFlag: true },
            { date: "2026-02-14", readiness: 48, volume: 1500, injuryFlag: true },
            { date: "2026-02-15", readiness: 42, volume: 1200, injuryFlag: true },
            { date: "2026-02-16", readiness: 40, volume: 1000, injuryFlag: true },
            { date: "2026-02-17", readiness: 45, volume: 0, injuryFlag: true },
        ],
    },
];

export const dataService = {
    getAthletes: async (): Promise<Athlete[]> => {
        return [...athletes];
    },

    getAthleteById: async (id: string): Promise<Athlete | undefined> => {
        return athletes.find((a) => a.id === id);
    },

    updateAthlete: async (id: string, updates: Partial<Athlete>): Promise<Athlete> => {
        const index = athletes.findIndex((a) => a.id === id);
        if (index === -1) throw new Error("Athlete not found");

        // Immutable update to mock storage
        athletes[index] = { ...athletes[index], ...updates };

        // If readiness updated, we should also update history for the graph
        if (updates.readinessScore !== undefined) {
            const today = new Date().toISOString().split("T")[0];
            const historyIndex = athletes[index].history.findIndex(h => h.date === today);
            if (historyIndex !== -1) {
                athletes[index].history[historyIndex].readiness = updates.readinessScore;
            } else {
                athletes[index].history.push({
                    date: today,
                    readiness: updates.readinessScore,
                    volume: 0,
                    injuryFlag: updates.injuryStatus === "INJURED" || athletes[index].injuryStatus === "INJURED"
                });
            }
        }

        return { ...athletes[index] };
    },

    addAthlete: async (name: string): Promise<Athlete> => {
        const newAthlete: Athlete = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            readinessScore: 70,
            injuryStatus: "HEALTHY",
            phase: "NEURAL_RESET",
            sportContext: "GENERAL",
            experienceLevel: undefined,
            profileStatus: "NONE",
            notes: "",
            // New athletes start as GENERAL → no block.
            // If the coach edits sportContext to STRENGTH, the lazy
            // init in handleReadinessSubmit creates a Phase 1 block
            // automatically before the first session build runs.
            strengthBlock: undefined,
            history: [{ date: new Date().toISOString().split("T")[0], readiness: 70, volume: 0, injuryFlag: false }],
        };
        athletes.push(newAthlete);
        return { ...newAthlete };
    },

    deleteAthlete: async (id: string): Promise<void> => {
        athletes = athletes.filter((a) => a.id !== id);
    },
};

